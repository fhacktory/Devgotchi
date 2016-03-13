class @Skill

  constructor: (@name, @price, @number, @max, @callback) ->
    $(".#{@name}-price").html(@price + '$')
    $(".#{@name}-number").html(@number)
    $(".#{@name}-max").html(@max)

  increase_number: ->
    @number += 1
    @callback()
    $(".#{@name}-number").html(@number)
