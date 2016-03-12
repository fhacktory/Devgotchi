class @Dev
  animation =
    default: "default.png"
    victory: "victory.gif"

  constructor: (@selector) ->
    @status = "default"

  change_status: (status) ->
    @status = status
    @animate()

  animate: ->
    @selector.attr("src", "assets/developer/#{animation[@status]}")
