class @Skill

  constructor: (@name, @price, @number, @callback) ->
    $(".#{@name}-price").html(@price + '$')
    $(".#{@name}-number").html(@number)

  increase_number: ->
    @number += 1
    @callback()
    $(".#{@name}-number").html(@number)
