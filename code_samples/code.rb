class CollectionAssociation < Association #:nodoc:

      # Implements the reader method, e.g. foo.items for Foo.has_many :items
      def reader(force_reload = false)
        if force_reload
          ActiveSupport::Deprecation.warn(<<-MSG.squish)
            Passing an argument to force an association to reload is now
            deprecated and will be removed in Rails 5.1. Please call `reload`
            on the result collection proxy instead.
          MSG

          klass.uncached { reload }
        elsif stale_target?
          reload
        end

        if null_scope?
          # Cache the proxy separately before the owner has an id
          # or else a post-save proxy will still lack the id
          @null_proxy ||= CollectionProxy.create(klass, self)
        else
          @proxy ||= CollectionProxy.create(klass, self)
        end
      end

      # Implements the writer method, e.g. foo.items= for Foo.has_many :items
      def writer(records)
        replace(records)
      end

      # Implements the ids reader method, e.g. foo.item_ids for Foo.has_many :items
      def ids_reader
        if loaded?
          load_target.map do |record|
            record.send(reflection.association_primary_key)
          end
        else
          @association_ids ||= (
            column = "#{reflection.quoted_table_name}.#{reflection.association_primary_key}"
            scope.pluck(column)
          )
        end
      end

      # Implements the ids writer method, e.g. foo.item_ids= for Foo.has_many :items
      def ids_writer(ids)
        pk_type = reflection.primary_key_type
        ids = Array(ids).reject(&:blank?)
        ids.map! { |i| pk_type.cast(i) }
        records = klass.where(reflection.association_primary_key => ids).index_by do |r|
          r.send(reflection.association_primary_key)
        end.values_at(*ids)
        replace(records)
      end

      def reset
        super
        @target = []
      end

      def select(*fields)
        if block_given?
          load_target.select.each { |e| yield e }
        else
          scope.select(*fields)
        end
      end

      def find(*args)
        if block_given?
          load_target.find(*args) { |*block_args| yield(*block_args) }
        else
          if options[:inverse_of] && loaded?
            args_flatten = args.flatten
            raise RecordNotFound, "Couldn't find #{scope.klass.name} without an ID" if args_flatten.blank?
            result = find_by_scan(*args)

            result_size = Array(result).size
            if !result || result_size != args_flatten.size
              scope.raise_record_not_found_exception!(args_flatten, result_size, args_flatten.size)
            else
              result
            end
          else
            scope.find(*args)
          end
        end
      end
