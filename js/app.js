(function() {
  $(function() {
    var codeish, dev, game_running, level_up_modal, levels, load_file, load_level, name_input, new_game, skills, start_new_game, terminal;
    game_running = false;
    dev = new Dev($(".developer"));
    dev.load();
    codeish = '';
    terminal = $('.console');
    skills = {
      terminal: new Skill('terminal', 50, dev.skills.terminal || 0, 10, function() {
        $('.workspace').append('<pre class="console"></pre>');
        return terminal = $('.console');
      }),
      robot: new Skill('robot', 2000, dev.skills.robot || 0, 10, function() {
        return setInterval(function() {
          return $('.workspace').keyup();
        }, 100);
      })
    };
    new_game = $('.new-game').modal({
      closable: false
    });
    level_up_modal = $('.level-up').modal();
    name_input = $('.character-name');
    levels = {
      0: 'code.c',
      1: 'code.cpp',
      2: 'code.py',
      3: 'code.rb',
      4: 'code.lua',
      5: 'code.go'
    };
    if (dev.money < skills.terminal.price && skills.terminal.number === 0) {
      $('.terminal-skill').hide();
    }
    if (dev.money < skills.robot.price && skills.robot.number === 0) {
      $('.robot-skill').hide();
    }
    load_file = function(filename) {
      return $.ajax({
        url: "code_samples/" + filename,
        success: function(data) {
          codeish = data;
          return dev.set_xp_total(codeish.length);
        }
      });
    };
    start_new_game = function() {
      if (!dev.name) {
        new_game.modal("show");
        start_button.on('click', function() {
          dev.name = name_input.val();
          new_game.modal("hide");
          return load_level();
        });
      }
      return load_level();
    };
    $(document).keyup(function(event) {
      if (!game_running) {
        return;
      }
      dev.change_status("computing");
      dev.on_type();
      terminal.text(codeish.slice(0, dev.cur_xp + dev.increment));
      terminal.scrollTop(terminal[0].scrollHeight);
      if (dev.cur_xp > dev.xp_total) {
        dev.change_status("victory");
        dev.level_up();
        load_file(levels[dev.level]);
        terminal.text("");
        level_up_modal.modal({
          onHide: function() {
            return game_running = true;
          }
        });
        level_up_modal.modal('show');
        return game_running = false;
      }
    });
    $('.new-game-start').on('click', function() {
      dev.name = name_input.val();
      new_game.modal("hide");
      return load_level();
    });
    $('.terminal-btn').on('click', function() {
      return dev.buy(skills.terminal);
    });
    $('.robot-btn').on('click', function() {
      return dev.buy(skills.robot);
    });
    load_level = function() {
      game_running = true;
      return load_file(levels[dev.level]);
    };
    start_new_game();
    return setInterval(function() {
      return dev.save();
    }, 5000);
  });

}).call(this);

(function() {
  Function.prototype.setter = function(prop, set) {
    return Object.defineProperty(this.prototype, prop, {
      set: set,
      configurable: true
    });
  };

  this.Dev = (function() {
    var animation;

    animation = {
      "default": "default.png",
      victory: "victory.gif",
      computing: "computing.gif"
    };

    function Dev(selector, name) {
      this.selector = selector;
      this.name = name;
      this.status = "default";
      this.money = 0;
      this.hungry = 0;
      this.tired = 0;
      this.age = 0;
      this.level = 0;
      this.cur_xp = 0;
      this.xp_total = 0;
      this.increment = 1;
      this.skills = {
        terminal: 1,
        robot: 0
      };
      this.set_money(this.money);
      this.set_level(this.level);
    }

    Dev.prototype.on_type = function() {
      this.cur_xp += this.increment;
      this.set_money(parseInt(this.money) + this.increment * this.skills.terminal);
      return $('.xp').progress('increment', this.increment);
    };

    Dev.prototype.change_status = function(status) {
      this.status = status;
      return this.animate();
    };

    Dev.prototype.animate = function() {
      var new_animation_url, old_animation_url;
      new_animation_url = "assets/developer/" + animation[this.status];
      old_animation_url = this.selector.attr("src");
      if (new_animation_url !== old_animation_url) {
        return this.selector.attr("src", "assets/developer/" + animation[this.status]);
      }
    };

    Dev.prototype.set_xp_total = function(total) {
      this.xp_total = total;
      return $('.xp').progress({
        total: this.xp_total,
        text: {
          active: "Level " + this.level + " : ({value}/{total})",
          success: "LEVEL UP!"
        }
      });
    };

    Dev.prototype.level_up = function() {
      this.set_level(this.level + 1);
      return this.cur_xp = 0;
    };

    Dev.prototype.set_money = function(money) {
      this.money = money;
      $(".money").html(this.money);
      console.log("Money after set : " + this.money);
      if (this.money > 50) {
        $(".terminal-skill").show();
      }
      if (this.money > 2000) {
        return $(".robot-skill").show();
      }
    };

    Dev.prototype.set_level = function(level) {
      this.level = level;
      return $(".level").html(this.level);
    };

    Dev.prototype.buy = function(skill) {
      console.log("Money: " + this.money + ", skill price: " + skill.price);
      if (this.money > skill.price && skill.number < skill.max) {
        this.set_money(this.money - skill.price);
        skill.increase_number();
        return this.skills[skill.name] = skill.number;
      }
    };

    Dev.prototype.load = function() {
      var i, j, k, ref, ref1, results;
      if (localStorage.name === void 0) {
        return;
      }
      this.name = localStorage.name;
      this.set_money(parseInt(localStorage.money));
      this.hungry = localStorage.hungry;
      this.tired = localStorage.tired;
      this.set_level(localStorage.level);
      this.status = localStorage.status;
      if (localStorage.skills) {
        this.skills = JSON.parse(localStorage.skills);
        if (this.skills.terminal > 1) {
          for (i = j = 2, ref = this.skills.terminal; 2 <= ref ? j <= ref : j >= ref; i = 2 <= ref ? ++j : --j) {
            $('.workspace').append('<pre class="console"></pre>');
          }
        }
        if (this.skills.robot > 0) {
          results = [];
          for (i = k = 1, ref1 = this.skills.robot; 1 <= ref1 ? k <= ref1 : k >= ref1; i = 1 <= ref1 ? ++k : --k) {
            results.push(setInterval(function() {
              return $('.workspace').keyup();
            }, 100));
          }
          return results;
        }
      }
    };

    Dev.prototype.save = function() {
      localStorage.name = this.name;
      localStorage.money = this.money;
      localStorage.hungry = this.hungry;
      localStorage.tired = this.tired;
      localStorage.level = this.level;
      localStorage.status = this.status;
      return localStorage.skills = JSON.stringify(this.skills);
    };

    return Dev;

  })();

}).call(this);

(function() {
  this.Skill = (function() {
    function Skill(name, price, number, max, callback) {
      this.name = name;
      this.price = price;
      this.number = number;
      this.max = max;
      this.callback = callback;
      $("." + this.name + "-price").html(this.price + '$');
      $("." + this.name + "-number").html(this.number);
      $("." + this.name + "-max").html(this.max);
    }

    Skill.prototype.increase_number = function() {
      this.number += 1;
      this.callback();
      return $("." + this.name + "-number").html(this.number);
    };

    return Skill;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb2ZmZWUiLCJkZXZlbG9wZXIuY29mZmVlIiwic2tpbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsQ0FBQSxDQUFFLFNBQUE7QUFDQSxRQUFBO0lBQUEsWUFBQSxHQUFnQjtJQUNoQixHQUFBLEdBQW9CLElBQUEsR0FBQSxDQUFJLENBQUEsQ0FBRSxZQUFGLENBQUo7SUFDcEIsR0FBRyxDQUFDLElBQUosQ0FBQTtJQUNBLE9BQUEsR0FBZ0I7SUFDaEIsUUFBQSxHQUFnQixDQUFBLENBQUUsVUFBRjtJQUNoQixNQUFBLEdBQ0U7TUFBQSxRQUFBLEVBQWMsSUFBQSxLQUFBLENBQU0sVUFBTixFQUFrQixFQUFsQixFQUFzQixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVgsSUFBdUIsQ0FBN0MsRUFBZ0QsRUFBaEQsRUFBb0QsU0FBQTtRQUNoRSxDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsTUFBaEIsQ0FBdUIsNkJBQXZCO2VBQ0EsUUFBQSxHQUFXLENBQUEsQ0FBRSxVQUFGO01BRnFELENBQXBELENBQWQ7TUFHQSxLQUFBLEVBQVcsSUFBQSxLQUFBLENBQU0sT0FBTixFQUFlLElBQWYsRUFBcUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFYLElBQW9CLENBQXpDLEVBQTRDLEVBQTVDLEVBQWdELFNBQUE7ZUFDekQsV0FBQSxDQUFZLFNBQUE7aUJBQ1YsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLEtBQWhCLENBQUE7UUFEVSxDQUFaLEVBRUUsR0FGRjtNQUR5RCxDQUFoRCxDQUhYOztJQU9GLFFBQUEsR0FBZ0IsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsQ0FBcUI7TUFBQSxRQUFBLEVBQVUsS0FBVjtLQUFyQjtJQUNoQixjQUFBLEdBQWdCLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxLQUFmLENBQUE7SUFDaEIsVUFBQSxHQUFnQixDQUFBLENBQUUsaUJBQUY7SUFDaEIsTUFBQSxHQUNFO01BQUEsQ0FBQSxF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QUFiLEdBQXNCLElBQUMsQ0FBQTthQUN2QixZQUFZLENBQUMsTUFBYixHQUFzQixJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxNQUFoQjtJQVBsQjs7Ozs7QUE1RlI7OztBQ0FBO0VBQU0sSUFBQyxDQUFBO0lBRVEsZUFBQyxJQUFELEVBQVEsS0FBUixFQUFnQixNQUFoQixFQUF5QixHQUF6QixFQUErQixRQUEvQjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxNQUFEO01BQU0sSUFBQyxDQUFBLFdBQUQ7TUFDMUMsQ0FBQSxDQUFFLEdBQUEsR0FBSSxJQUFDLENBQUEsSUFBTCxHQUFVLFFBQVosQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixJQUFDLENBQUEsS0FBRCxHQUFTLEdBQW5DO01BQ0EsQ0FBQSxDQUFFLEdBQUEsR0FBSSxJQUFDLENBQUEsSUFBTCxHQUFVLFNBQVosQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixJQUFDLENBQUEsTUFBNUI7TUFDQSxDQUFBLENBQUUsR0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFMLEdBQVUsTUFBWixDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQUMsQ0FBQSxHQUF6QjtJQUhXOztvQkFLYixlQUFBLEdBQWlCLFNBQUE7TUFDZixJQUFDLENBQUEsTUFBRCxJQUFXO01BQ1gsSUFBQyxDQUFBLFFBQUQsQ0FBQTthQUNBLENBQUEsQ0FBRSxHQUFBLEdBQUksSUFBQyxDQUFBLElBQUwsR0FBVSxTQUFaLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsSUFBQyxDQUFBLE1BQTVCO0lBSGU7Ozs7O0FBUG5CIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiQgLT5cbiAgZ2FtZV9ydW5uaW5nICA9IGZhbHNlXG4gIGRldiAgICAgICAgICAgPSBuZXcgRGV2KCQoXCIuZGV2ZWxvcGVyXCIpKVxuICBkZXYubG9hZCgpXG4gIGNvZGVpc2ggICAgICAgPSAnJ1xuICB0ZXJtaW5hbCAgICAgID0gJCgnLmNvbnNvbGUnKVxuICBza2lsbHMgICAgICAgID1cbiAgICB0ZXJtaW5hbDogbmV3IFNraWxsKCd0ZXJtaW5hbCcsIDUwLCBkZXYuc2tpbGxzLnRlcm1pbmFsIG9yIDAsIDEwLCAtPlxuICAgICAgJCgnLndvcmtzcGFjZScpLmFwcGVuZCgnPHByZSBjbGFzcz1cImNvbnNvbGVcIj48L3ByZT4nKVxuICAgICAgdGVybWluYWwgPSAkKCcuY29uc29sZScpKVxuICAgIHJvYm90OiBuZXcgU2tpbGwoJ3JvYm90JywgMjAwMCwgZGV2LnNraWxscy5yb2JvdCBvciAwLCAxMCwgLT5cbiAgICAgIHNldEludGVydmFsIC0+XG4gICAgICAgICQoJy53b3Jrc3BhY2UnKS5rZXl1cCgpXG4gICAgICAsIDEwMClcbiAgbmV3X2dhbWUgICAgICA9ICQoJy5uZXctZ2FtZScpLm1vZGFsKGNsb3NhYmxlOiBmYWxzZSlcbiAgbGV2ZWxfdXBfbW9kYWw9ICQoJy5sZXZlbC11cCcpLm1vZGFsKClcbiAgbmFtZV9pbnB1dCAgICA9ICQoJy5jaGFyYWN0ZXItbmFtZScpXG4gIGxldmVscyAgICAgICAgID1cbiAgICAwOiAnY29kZS5jJ1xuICAgIDE6ICdjb2RlLmNwcCdcbiAgICAyOiAnY29kZS5weSdcbiAgICAzOiAnY29kZS5yYidcbiAgICA0OiAnY29kZS5sdWEnXG4gICAgNTogJ2NvZGUuZ28nXG5cbiAgaWYgZGV2Lm1vbmV5IDwgc2tpbGxzLnRlcm1pbmFsLnByaWNlIGFuZCBza2lsbHMudGVybWluYWwubnVtYmVyID09IDBcbiAgICAkKCcudGVybWluYWwtc2tpbGwnKS5oaWRlKClcbiAgaWYgZGV2Lm1vbmV5IDwgc2tpbGxzLnJvYm90LnByaWNlIGFuZCBza2lsbHMucm9ib3QubnVtYmVyID09IDBcbiAgICAkKCcucm9ib3Qtc2tpbGwnKS5oaWRlKClcblxuICBsb2FkX2ZpbGUgPSAoZmlsZW5hbWUpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IFwiY29kZV9zYW1wbGVzLyN7ZmlsZW5hbWV9XCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICBjb2RlaXNoID0gZGF0YVxuICAgICAgICBkZXYuc2V0X3hwX3RvdGFsKGNvZGVpc2gubGVuZ3RoKVxuXG4gIHN0YXJ0X25ld19nYW1lID0gLT5cbiAgICB1bmxlc3MgZGV2Lm5hbWVcbiAgICAgIG5ld19nYW1lLm1vZGFsKFwic2hvd1wiKVxuICAgICAgc3RhcnRfYnV0dG9uLm9uICdjbGljaycsIC0+XG4gICAgICAgIGRldi5uYW1lID0gbmFtZV9pbnB1dC52YWwoKVxuICAgICAgICBuZXdfZ2FtZS5tb2RhbChcImhpZGVcIilcbiAgICAgICAgbG9hZF9sZXZlbCgpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJChkb2N1bWVudCkua2V5dXAgKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZ2FtZV9ydW5uaW5nXG4gICAgZGV2LmNoYW5nZV9zdGF0dXMoXCJjb21wdXRpbmdcIilcbiAgICBkZXYub25fdHlwZSgpXG5cbiAgICB0ZXJtaW5hbC50ZXh0KGNvZGVpc2guc2xpY2UoMCwgZGV2LmN1cl94cCArIGRldi5pbmNyZW1lbnQpKVxuICAgIHRlcm1pbmFsLnNjcm9sbFRvcCh0ZXJtaW5hbFswXS5zY3JvbGxIZWlnaHQpXG5cbiAgICBpZiBkZXYuY3VyX3hwID4gZGV2LnhwX3RvdGFsXG4gICAgICBkZXYuY2hhbmdlX3N0YXR1cyhcInZpY3RvcnlcIilcbiAgICAgIGRldi5sZXZlbF91cCgpXG4gICAgICBsb2FkX2ZpbGUobGV2ZWxzW2Rldi5sZXZlbF0pXG4gICAgICB0ZXJtaW5hbC50ZXh0KFwiXCIpXG4gICAgICBsZXZlbF91cF9tb2RhbC5tb2RhbFxuICAgICAgICBvbkhpZGU6IC0+XG4gICAgICAgICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgICAgbGV2ZWxfdXBfbW9kYWwubW9kYWwgJ3Nob3cnXG4gICAgICBnYW1lX3J1bm5pbmcgPSBmYWxzZVxuXG4gICQoJy5uZXctZ2FtZS1zdGFydCcpLm9uICdjbGljaycsIC0+XG4gICAgZGV2Lm5hbWUgPSBuYW1lX2lucHV0LnZhbCgpXG4gICAgbmV3X2dhbWUubW9kYWwoXCJoaWRlXCIpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJCgnLnRlcm1pbmFsLWJ0bicpLm9uICdjbGljaycsIC0+XG4gICAgZGV2LmJ1eShza2lsbHMudGVybWluYWwpXG5cbiAgJCgnLnJvYm90LWJ0bicpLm9uICdjbGljaycsIC0+XG4gICAgZGV2LmJ1eShza2lsbHMucm9ib3QpXG5cbiAgbG9hZF9sZXZlbCA9IC0+XG4gICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgIGxvYWRfZmlsZShsZXZlbHNbZGV2LmxldmVsXSlcblxuICBzdGFydF9uZXdfZ2FtZSgpXG5cbiAgc2V0SW50ZXJ2YWwgLT5cbiAgICBkZXYuc2F2ZSgpXG4gICwgNTAwMFxuIiwiRnVuY3Rpb246OnNldHRlciA9IChwcm9wLCBzZXQpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCB7c2V0LCBjb25maWd1cmFibGU6IHllc31cblxuY2xhc3MgQERldlxuICBhbmltYXRpb24gPVxuICAgIGRlZmF1bHQ6ICAgIFwiZGVmYXVsdC5wbmdcIlxuICAgIHZpY3Rvcnk6ICAgIFwidmljdG9yeS5naWZcIlxuICAgIGNvbXB1dGluZzogIFwiY29tcHV0aW5nLmdpZlwiXG5cbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IsIEBuYW1lKSAtPlxuICAgIEBzdGF0dXMgICAgID0gXCJkZWZhdWx0XCJcbiAgICBAbW9uZXkgICAgICA9IDBcbiAgICBAaHVuZ3J5ICAgICA9IDBcbiAgICBAdGlyZWQgICAgICA9IDBcbiAgICBAYWdlICAgICAgICA9IDBcbiAgICBAbGV2ZWwgICAgICA9IDBcbiAgICBAY3VyX3hwICAgICA9IDBcbiAgICBAeHBfdG90YWwgICA9IDBcbiAgICBAaW5jcmVtZW50ICA9IDFcbiAgICBAc2tpbGxzID1cbiAgICAgIHRlcm1pbmFsOiAxXG4gICAgICByb2JvdDogMFxuICAgIEBzZXRfbW9uZXkoQG1vbmV5KVxuICAgIEBzZXRfbGV2ZWwoQGxldmVsKVxuXG4gIG9uX3R5cGU6IC0+XG4gICAgQGN1cl94cCArPSBAaW5jcmVtZW50XG4gICAgQHNldF9tb25leShwYXJzZUludChAbW9uZXkpICsgQGluY3JlbWVudCAqIEBza2lsbHMudGVybWluYWwpXG4gICAgJCgnLnhwJykucHJvZ3Jlc3MgJ2luY3JlbWVudCcsIEBpbmNyZW1lbnRcblxuICBjaGFuZ2Vfc3RhdHVzOiAoc3RhdHVzKSAtPlxuICAgIEBzdGF0dXMgPSBzdGF0dXNcbiAgICBAYW5pbWF0ZSgpXG5cbiAgYW5pbWF0ZTogLT5cbiAgICBuZXdfYW5pbWF0aW9uX3VybCA9IFwiYXNzZXRzL2RldmVsb3Blci8je2FuaW1hdGlvbltAc3RhdHVzXX1cIlxuICAgIG9sZF9hbmltYXRpb25fdXJsID0gQHNlbGVjdG9yLmF0dHIoXCJzcmNcIilcblxuICAgIGlmIG5ld19hbmltYXRpb25fdXJsICE9IG9sZF9hbmltYXRpb25fdXJsXG4gICAgICBAc2VsZWN0b3IuYXR0cihcInNyY1wiLCBcImFzc2V0cy9kZXZlbG9wZXIvI3thbmltYXRpb25bQHN0YXR1c119XCIpXG5cbiAgc2V0X3hwX3RvdGFsOiAodG90YWwpIC0+XG4gICAgQHhwX3RvdGFsID0gdG90YWxcbiAgICAkKCcueHAnKS5wcm9ncmVzc1xuICAgICAgdG90YWw6IEB4cF90b3RhbFxuICAgICAgdGV4dDpcbiAgICAgICAgYWN0aXZlOiBcIkxldmVsICN7QGxldmVsfSA6ICh7dmFsdWV9L3t0b3RhbH0pXCJcbiAgICAgICAgc3VjY2VzczogXCJMRVZFTCBVUCFcIlxuXG4gIGxldmVsX3VwOiAtPlxuICAgIEBzZXRfbGV2ZWwoQGxldmVsICsgMSlcbiAgICBAY3VyX3hwID0gMFxuXG4gIHNldF9tb25leTogKG1vbmV5KSAtPlxuICAgIEBtb25leSA9IG1vbmV5XG4gICAgJChcIi5tb25leVwiKS5odG1sKEBtb25leSlcblxuICAgIGNvbnNvbGUubG9nIFwiTW9uZXkgYWZ0ZXIgc2V0IDogI3tAbW9uZXl9XCJcbiAgICBpZiBAbW9uZXkgPiA1MFxuICAgICAgJChcIi50ZXJtaW5hbC1za2lsbFwiKS5zaG93KClcbiAgICBpZiBAbW9uZXkgPiAyMDAwXG4gICAgICAkKFwiLnJvYm90LXNraWxsXCIpLnNob3coKVxuXG4gIHNldF9sZXZlbDogKGxldmVsKSAtPlxuICAgIEBsZXZlbCA9IGxldmVsXG4gICAgJChcIi5sZXZlbFwiKS5odG1sKEBsZXZlbClcblxuICBidXk6IChza2lsbCkgLT5cbiAgICBjb25zb2xlLmxvZyBcIk1vbmV5OiAje0Btb25leX0sIHNraWxsIHByaWNlOiAje3NraWxsLnByaWNlfVwiXG4gICAgaWYgQG1vbmV5ID4gc2tpbGwucHJpY2UgYW5kIHNraWxsLm51bWJlciA8IHNraWxsLm1heFxuICAgICAgQHNldF9tb25leShAbW9uZXkgLSBza2lsbC5wcmljZSlcbiAgICAgIHNraWxsLmluY3JlYXNlX251bWJlcigpXG4gICAgICBAc2tpbGxzW3NraWxsLm5hbWVdID0gc2tpbGwubnVtYmVyXG5cbiAgbG9hZDogLT5cbiAgICByZXR1cm4gaWYgbG9jYWxTdG9yYWdlLm5hbWUgPT0gdW5kZWZpbmVkXG4gICAgQG5hbWUgPSBsb2NhbFN0b3JhZ2UubmFtZVxuICAgIEBzZXRfbW9uZXkocGFyc2VJbnQobG9jYWxTdG9yYWdlLm1vbmV5KSlcbiAgICBAaHVuZ3J5ID0gbG9jYWxTdG9yYWdlLmh1bmdyeVxuICAgIEB0aXJlZCA9IGxvY2FsU3RvcmFnZS50aXJlZFxuICAgIEBzZXRfbGV2ZWwobG9jYWxTdG9yYWdlLmxldmVsKVxuICAgIEBzdGF0dXMgPSBsb2NhbFN0b3JhZ2Uuc3RhdHVzXG4gICAgaWYgbG9jYWxTdG9yYWdlLnNraWxsc1xuICAgICAgQHNraWxscyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLnNraWxscylcbiAgICAgIGlmIEBza2lsbHMudGVybWluYWwgPiAxXG4gICAgICAgICQoJy53b3Jrc3BhY2UnKS5hcHBlbmQoJzxwcmUgY2xhc3M9XCJjb25zb2xlXCI+PC9wcmU+JykgZm9yIGkgaW4gWzIuLkBza2lsbHMudGVybWluYWxdXG4gICAgICBpZiBAc2tpbGxzLnJvYm90ID4gMFxuICAgICAgICBzZXRJbnRlcnZhbCAtPlxuICAgICAgICAgICQoJy53b3Jrc3BhY2UnKS5rZXl1cCgpXG4gICAgICAgICwgMTAwIGZvciBpIGluIFsxLi5Ac2tpbGxzLnJvYm90XVxuXG5cbiAgc2F2ZTogLT5cbiAgICBsb2NhbFN0b3JhZ2UubmFtZSA9IEBuYW1lXG4gICAgbG9jYWxTdG9yYWdlLm1vbmV5ID0gQG1vbmV5XG4gICAgbG9jYWxTdG9yYWdlLmh1bmdyeSA9IEBodW5ncnlcbiAgICBsb2NhbFN0b3JhZ2UudGlyZWQgPSBAdGlyZWRcbiAgICBsb2NhbFN0b3JhZ2UubGV2ZWwgPSBAbGV2ZWxcbiAgICBsb2NhbFN0b3JhZ2Uuc3RhdHVzID0gQHN0YXR1c1xuICAgIGxvY2FsU3RvcmFnZS5za2lsbHMgPSBKU09OLnN0cmluZ2lmeShAc2tpbGxzKVxuIiwiY2xhc3MgQFNraWxsXG5cbiAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByaWNlLCBAbnVtYmVyLCBAbWF4LCBAY2FsbGJhY2spIC0+XG4gICAgJChcIi4je0BuYW1lfS1wcmljZVwiKS5odG1sKEBwcmljZSArICckJylcbiAgICAkKFwiLiN7QG5hbWV9LW51bWJlclwiKS5odG1sKEBudW1iZXIpXG4gICAgJChcIi4je0BuYW1lfS1tYXhcIikuaHRtbChAbWF4KVxuXG4gIGluY3JlYXNlX251bWJlcjogLT5cbiAgICBAbnVtYmVyICs9IDFcbiAgICBAY2FsbGJhY2soKVxuICAgICQoXCIuI3tAbmFtZX0tbnVtYmVyXCIpLmh0bWwoQG51bWJlcilcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
