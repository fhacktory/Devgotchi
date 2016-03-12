class @Dev
  animation =
    default:    "default.png"
    victory:    "victory.gif"
    computing:  "computing.gif"

  constructor: (@selector) ->
    @status = "default"

  change_status: (status) ->
    @status = status
    @animate()

  animate: ->
    new_animation_url = "assets/developer/#{animation[@status]}"
    old_animation_url = @selector.attr("src")

    if new_animation_url != old_animation_url
      @selector.attr("src", "assets/developer/#{animation[@status]}")
