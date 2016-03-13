$ ->
  game_running  = false
  increment     = 20
  dev           = new Dev($(".developer"))
  codeish       = ''
  index         = 0
  terminal      = $('.console')
  new_game      = $('.new-game').modal()
  level_up_modal= $('.level-up').modal()
  start_button  = $('.new-game-start')
  name_input    = $('.character-name')
  levels         =
    0: 'code.c'
    1: 'code.cpp'
    2: 'code.py'
    3: 'code.rb'
    4: 'code.lua'
    5: 'code.go'

  load_file = (filename) ->
    $.ajax
      url: "code_samples/#{filename}"
      success: (data) ->
        codeish = data

  $(document).keyup (event) ->
    return unless game_running
    dev.change_status("computing")
    terminal.append(codeish.slice(index, index + increment))
    terminal.scrollTop(terminal[0].scrollHeight)
    index += increment

    if index > codeish.length
      dev.change_status("victory")
      dev.level_up()
      load_file(levels[dev.level])
      index = 0
      terminal.html("")
      level_up_modal.modal("show")
      game_running = false

  start_button.on 'click', ->
    dev.name = name_input.val()
    new_game.modal("hide")
    load_level()

  load_level = () ->
    game_running = true
    load_file(levels[dev.level])

  dev.load()

  if !dev.name
    new_game.modal("show")
  else
    load_level()
