$ ->
  game_running  = false
  dev           = new Dev($(".developer"))
  dev.load()
  codeish       = ''
  terminal      = $('.console')
  skills        =
    terminal: new Skill('terminal', 50, dev.skills.terminal or 0, 10, ->
      $('.workspace').append('<pre class="console"></pre>')
      terminal = $('.console'))
    robot: new Skill('robot', 2000, dev.skills.robot or 0, 10, ->
      setInterval ->
        $('.workspace').keyup()
      , 100)
  new_game      = $('.new-game').modal(closable: false)
  level_up_modal= $('.level-up').modal()
  name_input    = $('.character-name')
  levels         =
    0: 'code.c'
    1: 'code.cpp'
    2: 'code.py'
    3: 'code.rb'
    4: 'code.lua'
    5: 'code.go'

  if dev.money < skills.terminal.price and skills.terminal.number == 0
    $('.terminal-skill').hide()
  if dev.money < skills.robot.price and skills.robot.number == 0
    $('.robot-skill').hide()

  load_file = (filename) ->
    $.ajax
      url: "code_samples/#{filename}"
      success: (data) ->
        codeish = data
        dev.set_xp_total(codeish.length)

  start_new_game = ->
    unless dev.name
      new_game.modal("show")
      start_button.on 'click', ->
        dev.name = name_input.val()
        new_game.modal("hide")
        load_level()
    load_level()

  $(document).keyup (event) ->
    return unless game_running
    dev.change_status("computing")
    dev.on_type()

    terminal.text(codeish.slice(0, dev.cur_xp + dev.increment))
    terminal.scrollTop(terminal[0].scrollHeight)

    if dev.cur_xp > dev.xp_total
      dev.change_status("victory")
      dev.level_up()
      load_file(levels[dev.level])
      terminal.text("")
      level_up_modal.modal
        onHide: ->
          game_running = true
      level_up_modal.modal 'show'
      game_running = false

  $('.new-game-start').on 'click', ->
    dev.name = name_input.val()
    new_game.modal("hide")
    load_level()

  $('.terminal-btn').on 'click', ->
    dev.buy(skills.terminal)

  $('.robot-btn').on 'click', ->
    dev.buy(skills.robot)

  load_level = ->
    game_running = true
    load_file(levels[dev.level])

  start_new_game()

  setInterval ->
    dev.save()
  , 5000
