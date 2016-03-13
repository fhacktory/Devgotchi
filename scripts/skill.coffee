class @Skill

  constructor: (@name, @price, @number) ->
    $(".#{@name}-price").html(@price + '$')
    $(".#{@name}-number").html(@number)

  increase_number: ->
    @number += 1
    $(".#{@name}-number").html(@number)
