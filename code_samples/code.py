from __future__ import absolute_import

import argparse
import os
import sys
from collections import OrderedDict
from functools import wraps

import falcon
from falcon import HTTP_BAD_REQUEST

import hug._empty as empty
import hug.api
import hug.output_format
import hug.types as types
from hug import introspect
from hug.exceptions import InvalidTypeData
from hug.input_format import separate_encoding
from hug.types import MarshmallowSchema, Multiple, OneOf, SmartBoolean, Text, text


class Interfaces(object):
    """Defines the per-function singleton applied to hugged functions defining common data needed by all interfaces"""

    def __init__(self, function):
        self.spec = getattr(function, 'original', function)
        self.function = function

        self.takes_kargs = introspect.takes_kargs(self.spec)
        self.takes_kwargs = introspect.takes_kwargs(self.spec)

        self.parameters = introspect.arguments(self.spec, 1 if self.takes_kargs else 0)
        if self.takes_kargs:
            self.karg = self.parameters[-1]

        self.defaults = {}
        for index, default in enumerate(reversed(self.spec.__defaults__ or ())):
            self.defaults[self.parameters[-(index + 1)]] = default

        self.required = self.parameters[:-(len(self.spec.__defaults__ or ())) or None]
        if introspect.is_method(self.spec):
            self.required = self.required[1:]
            self.parameters = self.parameters[1:]

        self.transform = self.spec.__annotations__.get('return', None)
        self.directives = {}
        self.input_transformations = {}
        for name, transformer in self.spec.__annotations__.items():
            if isinstance(transformer, str):
                continue
            elif hasattr(transformer, 'directive'):
                self.directives[name] = transformer
                continue

            if hasattr(transformer, 'load'):
                transformer = MarshmallowSchema(transformer)
            elif hasattr(transformer, 'deserialize'):
                transformer = transformer.deserialize

            self.input_transformations[name] = transformer


class Interface(object):
    """Defines the basic hug interface object, which is responsible for wrapping a user defined function and providing
       all the info requested in the function as well as the route

       A Interface object should be created for every kind of protocal hug supports
    """
    __slots__ = ('interface', 'api', 'defaults', 'parameters', 'required', 'outputs', 'on_invalid', 'requires',
                 'validate_function', 'transform', 'examples', 'output_doc', 'wrapped', 'directives',
                 'raise_on_invalid', 'invalid_outputs')

    def __init__(self, route, function):
        self.api = route.get('api', hug.api.from_object(function))
        if 'examples' in route:
            self.examples = route['examples']
        if not hasattr(function, 'interface'):
            function.__dict__['interface'] = Interfaces(function)

        self.interface = function.interface
        self.requires = route.get('requires', ())
        if 'validate' in route:
            self.validate_function = route['validate']
        if 'output_invalid' in route:
            self.invalid_outputs = route['output_invalid']

        if not 'parameters' in route:
            self.defaults = self.interface.defaults
            self.parameters = self.interface.parameters
            self.required = self.interface.required
        else:
            self.defaults = route.get('defaults', {})
            self.parameters = tuple(route['parameters'])
            self.required = tuple([parameter for parameter in self.parameters if parameter not in self.defaults])

        self.outputs = route.get('output', None)
        self.transform = route.get('transform', None)
        if self.transform is None and not isinstance(self.interface.transform, (str, type(None))):
            self.transform = self.interface.transform

        if hasattr(self.transform, 'dump'):
            self.transform = self.transform.dump
            self.output_doc = self.transform.__doc__
        elif self.transform or self.interface.transform:
            output_doc = (self.transform or self.interface.transform)
            self.output_doc = output_doc if type(output_doc) is str else output_doc.__doc__

        self.raise_on_invalid = route.get('raise_on_invalid', False)
        if 'on_invalid' in route:
            self.on_invalid = route['on_invalid']
        elif self.transform:
            self.on_invalid = self.transform

        defined_directives = self.api.directives()
        used_directives = set(self.parameters).intersection(defined_directives)
        self.directives = {directive_name: defined_directives[directive_name] for directive_name in used_directives}
        self.directives.update(self.interface.directives)

    def validate(self, input_parameters):
        """Runs all set type transformers / validators against the provided input parameters and returns any errors"""
        errors = {}
        for key, type_handler in self.interface.input_transformations.items():
            if self.raise_on_invalid:
                if key in input_parameters:
                    input_parameters[key] = type_handler(input_parameters[key])
            else:
                try:
                    if key in input_parameters:
                        input_parameters[key] = type_handler(input_parameters[key])
                except InvalidTypeData as error:
                    errors[key] = error.reasons or str(error.message)
                except Exception as error:
                    if hasattr(error, 'args') and error.args:
                        errors[key] = error.args[0]
                    else:
                        errors[key] = str(error)

        for require in self.interface.required:
            if not require in input_parameters:
                errors[require] = "Required parameter not supplied"
        if not errors and getattr(self, 'validate_function', False):
            errors = self.validate_function(input_parameters)
        return errors
