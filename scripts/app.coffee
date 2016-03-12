$ ->
  increment = 5
  codeish   = ''
  index     = 0
  score     = -1
  terminal  = $('.console')
  level     =
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

  inc_score()
  load_file(level[score])

  $(document).keyup (event) ->
    terminal.append(codeish.slice(index, index + increment))
    terminal.scrollTop(terminal[0].scrollHeight)
    index += increment
    if index > codeish.length
      inc_score()
      index = 0
      load_file(level[score])
      terminal.html("")
