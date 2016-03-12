$ ->
  increment     = 20
  codeish       = ''
  index         = 0
  score         = -1
  terminal      = $('.console')
  modal         = $('.modal')
  close_modal   = $('.modal-close')
  level_up_modal= $('.level-up')
  start_button  = $('.new-game-start')
  name_input    = $('.character-name')
  level         =
    0: 'code.c'
    1: 'code.cpp'
    2: 'code.py'
    3: 'code.rb'
    4: 'code.lua'
    5: 'code.go'

  inc_score = ->
    score += 1
    $(".score").html(score)

  load_file = (filename) ->
    $.ajax
      url: "code_samples/#{filename}"
      success: (data) ->
        codeish = data

  $(document).keyup (event) ->
    terminal.append(codeish.slice(index, index + increment))
    terminal.scrollTop(terminal[0].scrollHeight)
    index += increment
    if index > codeish.length
      inc_score()
      load_file(level[score])
      index = 0
      terminal.html("")
      level_up_modal.show()

  close_modal.on 'click', ->
    modal.hide()

  start_button.on 'click', ->
    localStorage.character_name = name_input.val()
    modal.hide()
    score *= 0
    load_level()
    dev = new Dev($(".developer"))

  load_level = () ->
    load_file(level[score])

  character_name = localStorage.character_name
  if character_name == undefined
    modal.show()
  else
    score *= 0
    load_level()
    dev = new Dev($(".developer"))
