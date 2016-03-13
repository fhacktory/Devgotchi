Function::setter = (prop, set) ->
  Object.defineProperty @prototype, prop, {set, configurable: yes}

class @Dev
  animation =
    default:    "default.png"
    victory:    "victory.gif"
    computing:  "computing.gif"

  constructor: (@selector, @name) ->
    @status     = "default"
    @money      = 0
    @hungry     = 0
    @tired      = 0
    @age        = 0
    @level      = 0
    @cur_xp     = 0
    @xp_total   = 0
    @increment  = 20

  one_type: ->
    @cur_xp += @increment
    $('.xp').progress 'increment', @increment

  change_status: (status) ->
    @status = status
    @animate()

  animate: ->
    new_animation_url = "assets/developer/#{animation[@status]}"
    old_animation_url = @selector.attr("src")

    if new_animation_url != old_animation_url
      @selector.attr("src", "assets/developer/#{animation[@status]}")

  set_xp_total: (total) ->
    @xp_total = total
    $('.xp').progress
      total: @xp_total
      text:
        active: "Level #{@level} : ({value}/{total})"
        success: "LEVEL UP!"

  level_up: ->
    @level += 1
    @cur_xp = 0
    $(".score").html(@level)


  load: ->
    return if localStorage.name == undefined
    @name = localStorage.name
    @money = localStorage.money
    @hungry = localStorage.hungry
    @tired = localStorage.tired
    @level = +localStorage.level
    @status = localStorage.status

  save: ->
    localStorage.name = @name
    localStorage.money = @money
    localStorage.hungry = @hungry
    localStorage.tired = @tired
    localStorage.level = @level
    localStorage.status = @status
