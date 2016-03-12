require "Window"


local ReArms = {}

local LocWpnName = {
	enUS = "(%S+)'s Weapon",
	deDE = "Waffe von (%S+)",
	frFR = "Arme de (%S+)",
}

local function GetLocaleWpnName()
	local s = Apollo.GetString(1)

	if s == "Annuler" then
		return LocWpnName.frFR
	elseif s == "Abbrechen" then
		return LocWpnName.deDE
	end
	return LocWpnName.enUS
end

function ReArms:new(o)
    o = o or {}
    setmetatable(o, self)
    self.__index = self
	self.unitArm = nil

	self.WpnName = GetLocaleWpnName()

    return o
end

function ReArms:Init()
	local bHasConfigureFunction = false
	local strConfigureButtonText = ""
	local tDependencies = {
		-- "UnitOrPackageName",
	}
    Apollo.RegisterAddon(self, bHasConfigureFunction, strConfigureButtonText, tDependencies)
end
