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
      }),
      pizza: new Skill('pizza', 20000, dev.skills.pizza || 0, 10, function() {})
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
        $('.new-game-start').on('click', function() {
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
    $('.pizza-btn').on('click', function() {
      return dev.buy(skills.pizza);
    });
    load_level = function() {
      game_running = true;
      return load_file(levels[dev.level]);
    };
    start_new_game();
    return setInterval(function() {
      return dev.save();
    }, 20000);
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
        robot: 0,
        pizza: 0
      };
      this.set_money(this.money);
      this.set_level(this.level);
    }

    Dev.prototype.on_type = function() {
      this.cur_xp += this.increment;
      this.set_money(parseInt(this.money) + (this.increment * this.skills.terminal * (1 + (10 * this.skills.pizza))));
      return $('.xp').progress('increment', this.increment);
    };

    Dev.prototype.decrease_pizza = function() {
      return this.skills.pizza -= 1;
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
      this.level = parseInt(level);
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

    Dev.prototype.dec_pizza = function() {
      return this.skills.pizza -= 1;
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
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Skill = (function() {
    function Skill(name, price, number, max, callback) {
      this.name = name;
      this.price = price;
      this.number = number;
      this.max = max;
      this.callback = callback;
      this.decrease_number = bind(this.decrease_number, this);
      $("." + this.name + "-price").html(this.price + '$');
      $("." + this.name + "-number").html(this.number);
      $("." + this.name + "-max").html(this.max);
    }

    Skill.prototype.increase_number = function() {
      this.number += 1;
      this.callback();
      return $("." + this.name + "-number").html(this.number);
    };

    Skill.prototype.decrease_number = function() {
      this.number -= 1;
      return $("." + this.name + "-number").html(this.number);
    };

    return Skill;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb2ZmZWUiLCJkZXZlbG9wZXIuY29mZmVlIiwic2tpbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsQ0FBQSxDQUFFLFNBQUE7QUFDQSxRQUFBO0lBQUEsWUFBQSxHQUFnQjtJQUNoQixHQUFBLEdBQW9CLElBQUEsR0FBQSxDQUFJLENBQUEsQ0FBRSxZQUFGLENBQUo7SUFDcEIsR0FBRyxDQUFDLElBQUosQ0FBQTtJQUNBLE9BQUEsR0FBZ0I7SUFDaEIsUUFBQSxHQUFnQixDQUFBLENBQUUsVUFBRjtJQUNoQixNQUFBLEdBQ0U7TUFBQSxRQUFBLEVBQWMsSUFBQSxLQUFBLENBQU0sVUFBTixFQUFrQixFQUFsQixFQUFzQixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVgsSUFBdUIsQ0FBN0MsRUFBZ0QsRUFBaEQsRUFBb0QsU0FBQTtRQUNoRSxDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsTUFBaEIsQ0FBdUIsNkJBQXZCO2VBQ0EsUUFBQSxHQUFXLENBQUEsQ0FBRSxVQUFGO01BRnFELENBQXBELENBQWQ7TUFHQSxLQUFBLEVBQVcsSUFBQSxLQUFBLENBQU0sT0FBTixFQUFlLElBQWYsRUFBcUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFYLElBQW9CLENBQXpDLEVBQTRDLEVBQTVDLEVBQWdELFNBQUE7ZUFDekQsV0FBQSxDQUFZLFNBQUE7aUJBQ1YsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLEtBQWhCLENBQUE7UUFEVSxDQUFaLEVBRUUsR0FGRjtNQUR5RCxDQUFoRCxDQUhYO01BT0EsS0FBQSxFQUFXLElBQUEsS0FBQSxDQUFNLE9BQU4sRUFBZSxLQUFmLEVBQXNCLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBWCxJQUFvQixDQUExQyxFQUE2QyxFQUE3QyxFQUFpRCxTQUFBLEdBQUEsQ0FBakQsQ0FQWDs7SUFRRixRQUFBLEdBQWdCLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxLQUFmLENBQXFCO01BQUEsUUFBQSxF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QSxDQUFBLENBQUUsR0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFMLEdBQVUsU0FBWixDQUFxQixDQUFDLElBQXRCLENBQTJCLElBQUMsQ0FBQSxNQUE1QjtNQUNBLENBQUEsQ0FBRSxHQUFBLEdBQUksSUFBQyxDQUFBLElBQUwsR0FBVSxNQUFaLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBQyxDQUFBLEdBQXpCO0lBSFc7O29CQUtiLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQUMsQ0FBQSxNQUFELElBQVc7TUFDWCxJQUFDLENBQUEsUUFBRCxDQUFBO2FBQ0EsQ0FBQSxDQUFFLEdBQUEsR0FBSSxJQUFDLENBQUEsSUFBTCxHQUFVLFNBQVosQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixJQUFDLENBQUEsTUFBNUI7SUFIZTs7b0JBS2pCLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQUMsQ0FBQSxNQUFELElBQVc7YUFDWCxDQUFBLENBQUUsR0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFMLEdBQVUsU0FBWixDQUFxQixDQUFDLElBQXRCLENBQTJCLElBQUMsQ0FBQSxNQUE1QjtJQUZlOzs7OztBQVpuQiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkIC0+XG4gIGdhbWVfcnVubmluZyAgPSBmYWxzZVxuICBkZXYgICAgICAgICAgID0gbmV3IERldigkKFwiLmRldmVsb3BlclwiKSlcbiAgZGV2LmxvYWQoKVxuICBjb2RlaXNoICAgICAgID0gJydcbiAgdGVybWluYWwgICAgICA9ICQoJy5jb25zb2xlJylcbiAgc2tpbGxzICAgICAgICA9XG4gICAgdGVybWluYWw6IG5ldyBTa2lsbCgndGVybWluYWwnLCA1MCwgZGV2LnNraWxscy50ZXJtaW5hbCBvciAwLCAxMCwgLT5cbiAgICAgICQoJy53b3Jrc3BhY2UnKS5hcHBlbmQoJzxwcmUgY2xhc3M9XCJjb25zb2xlXCI+PC9wcmU+JylcbiAgICAgIHRlcm1pbmFsID0gJCgnLmNvbnNvbGUnKSlcbiAgICByb2JvdDogbmV3IFNraWxsKCdyb2JvdCcsIDIwMDAsIGRldi5za2lsbHMucm9ib3Qgb3IgMCwgMTAsIC0+XG4gICAgICBzZXRJbnRlcnZhbCAtPlxuICAgICAgICAkKCcud29ya3NwYWNlJykua2V5dXAoKVxuICAgICAgLCAxMDApXG4gICAgcGl6emE6IG5ldyBTa2lsbCgncGl6emEnLCAyMDAwMCwgZGV2LnNraWxscy5waXp6YSBvciAwLCAxMCwgLT4pXG4gIG5ld19nYW1lICAgICAgPSAkKCcubmV3LWdhbWUnKS5tb2RhbChjbG9zYWJsZTogZmFsc2UpXG4gIGxldmVsX3VwX21vZGFsPSAkKCcubGV2ZWwtdXAnKS5tb2RhbCgpXG4gIG5hbWVfaW5wdXQgICAgPSAkKCcuY2hhcmFjdGVyLW5hbWUnKVxuICBsZXZlbHMgICAgICAgICA9XG4gICAgMDogJ2NvZGUuYydcbiAgICAxOiAnY29kZS5jcHAnXG4gICAgMjogJ2NvZGUucHknXG4gICAgMzogJ2NvZGUucmInXG4gICAgNDogJ2NvZGUubHVhJ1xuICAgIDU6ICdjb2RlLmdvJ1xuXG4gIGlmIGRldi5tb25leSA8IHNraWxscy50ZXJtaW5hbC5wcmljZSBhbmQgc2tpbGxzLnRlcm1pbmFsLm51bWJlciA9PSAwXG4gICAgJCgnLnRlcm1pbmFsLXNraWxsJykuaGlkZSgpXG4gIGlmIGRldi5tb25leSA8IHNraWxscy5yb2JvdC5wcmljZSBhbmQgc2tpbGxzLnJvYm90Lm51bWJlciA9PSAwXG4gICAgJCgnLnJvYm90LXNraWxsJykuaGlkZSgpXG5cbiAgbG9hZF9maWxlID0gKGZpbGVuYW1lKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBcImNvZGVfc2FtcGxlcy8je2ZpbGVuYW1lfVwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgY29kZWlzaCA9IGRhdGFcbiAgICAgICAgZGV2LnNldF94cF90b3RhbChjb2RlaXNoLmxlbmd0aClcblxuICBzdGFydF9uZXdfZ2FtZSA9IC0+XG4gICAgdW5sZXNzIGRldi5uYW1lXG4gICAgICBuZXdfZ2FtZS5tb2RhbChcInNob3dcIilcbiAgICAgICQoJy5uZXctZ2FtZS1zdGFydCcpLm9uICdjbGljaycsIC0+XG4gICAgICAgIGRldi5uYW1lID0gbmFtZV9pbnB1dC52YWwoKVxuICAgICAgICBuZXdfZ2FtZS5tb2RhbChcImhpZGVcIilcbiAgICAgICAgbG9hZF9sZXZlbCgpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJChkb2N1bWVudCkua2V5dXAgKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZ2FtZV9ydW5uaW5nXG4gICAgZGV2LmNoYW5nZV9zdGF0dXMoXCJjb21wdXRpbmdcIilcbiAgICBkZXYub25fdHlwZSgpXG5cbiAgICB0ZXJtaW5hbC50ZXh0KGNvZGVpc2guc2xpY2UoMCwgZGV2LmN1cl94cCArIGRldi5pbmNyZW1lbnQpKVxuICAgIHRlcm1pbmFsLnNjcm9sbFRvcCh0ZXJtaW5hbFswXS5zY3JvbGxIZWlnaHQpXG5cbiAgICBpZiBkZXYuY3VyX3hwID4gZGV2LnhwX3RvdGFsXG4gICAgICBkZXYuY2hhbmdlX3N0YXR1cyhcInZpY3RvcnlcIilcbiAgICAgIGRldi5sZXZlbF91cCgpXG4gICAgICBsb2FkX2ZpbGUobGV2ZWxzW2Rldi5sZXZlbF0pXG4gICAgICB0ZXJtaW5hbC50ZXh0KFwiXCIpXG4gICAgICBsZXZlbF91cF9tb2RhbC5tb2RhbFxuICAgICAgICBvbkhpZGU6IC0+XG4gICAgICAgICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgICAgbGV2ZWxfdXBfbW9kYWwubW9kYWwgJ3Nob3cnXG4gICAgICBnYW1lX3J1bm5pbmcgPSBmYWxzZVxuXG4gICQoJy5uZXctZ2FtZS1zdGFydCcpLm9uICdjbGljaycsIC0+XG4gICAgZGV2Lm5hbWUgPSBuYW1lX2lucHV0LnZhbCgpXG4gICAgbmV3X2dhbWUubW9kYWwoXCJoaWRlXCIpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJCgnLnRlcm1pbmFsLWJ0bicpLm9uICdjbGljaycsIC0+XG4gICAgZGV2LmJ1eShza2lsbHMudGVybWluYWwpXG5cbiAgJCgnLnJvYm90LWJ0bicpLm9uICdjbGljaycsIC0+XG4gICAgZGV2LmJ1eShza2lsbHMucm9ib3QpXG5cbiAgJCgnLnBpenphLWJ0bicpLm9uICdjbGljaycsIC0+XG4gICAgZGV2LmJ1eShza2lsbHMucGl6emEpXG5cbiAgbG9hZF9sZXZlbCA9IC0+XG4gICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgIGxvYWRfZmlsZShsZXZlbHNbZGV2LmxldmVsXSlcblxuICBzdGFydF9uZXdfZ2FtZSgpXG5cbiAgc2V0SW50ZXJ2YWwgLT5cbiAgICBkZXYuc2F2ZSgpXG4gICwgMjAwMDBcbiIsIkZ1bmN0aW9uOjpzZXR0ZXIgPSAocHJvcCwgc2V0KSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwge3NldCwgY29uZmlndXJhYmxlOiB5ZXN9XG5cbmNsYXNzIEBEZXZcbiAgYW5pbWF0aW9uID1cbiAgICBkZWZhdWx0OiAgICBcImRlZmF1bHQucG5nXCJcbiAgICB2aWN0b3J5OiAgICBcInZpY3RvcnkuZ2lmXCJcbiAgICBjb21wdXRpbmc6ICBcImNvbXB1dGluZy5naWZcIlxuXG4gIGNvbnN0cnVjdG9yOiAoQHNlbGVjdG9yLCBAbmFtZSkgLT5cbiAgICBAc3RhdHVzICAgICA9IFwiZGVmYXVsdFwiXG4gICAgQG1vbmV5ICAgICAgPSAwXG4gICAgQGh1bmdyeSAgICAgPSAwXG4gICAgQHRpcmVkICAgICAgPSAwXG4gICAgQGFnZSAgICAgICAgPSAwXG4gICAgQGxldmVsICAgICAgPSAwXG4gICAgQGN1cl94cCAgICAgPSAwXG4gICAgQHhwX3RvdGFsICAgPSAwXG4gICAgQGluY3JlbWVudCAgPSAxXG4gICAgQHNraWxscyA9XG4gICAgICB0ZXJtaW5hbDogMVxuICAgICAgcm9ib3Q6IDBcbiAgICAgIHBpenphOiAwXG4gICAgQHNldF9tb25leShAbW9uZXkpXG4gICAgQHNldF9sZXZlbChAbGV2ZWwpXG5cbiAgb25fdHlwZTogLT5cbiAgICBAY3VyX3hwICs9IEBpbmNyZW1lbnRcbiAgICBAc2V0X21vbmV5KHBhcnNlSW50KEBtb25leSkgKyAoQGluY3JlbWVudCAqIEBza2lsbHMudGVybWluYWwgKiAoMSArICgxMCAqIEBza2lsbHMucGl6emEpKSkpXG4gICAgJCgnLnhwJykucHJvZ3Jlc3MgJ2luY3JlbWVudCcsIEBpbmNyZW1lbnRcblxuICBkZWNyZWFzZV9waXp6YTogLT5cbiAgICBAc2tpbGxzLnBpenphIC09IDFcblxuICBjaGFuZ2Vfc3RhdHVzOiAoc3RhdHVzKSAtPlxuICAgIEBzdGF0dXMgPSBzdGF0dXNcbiAgICBAYW5pbWF0ZSgpXG5cbiAgYW5pbWF0ZTogLT5cbiAgICBuZXdfYW5pbWF0aW9uX3VybCA9IFwiYXNzZXRzL2RldmVsb3Blci8je2FuaW1hdGlvbltAc3RhdHVzXX1cIlxuICAgIG9sZF9hbmltYXRpb25fdXJsID0gQHNlbGVjdG9yLmF0dHIoXCJzcmNcIilcblxuICAgIGlmIG5ld19hbmltYXRpb25fdXJsICE9IG9sZF9hbmltYXRpb25fdXJsXG4gICAgICBAc2VsZWN0b3IuYXR0cihcInNyY1wiLCBcImFzc2V0cy9kZXZlbG9wZXIvI3thbmltYXRpb25bQHN0YXR1c119XCIpXG5cbiAgc2V0X3hwX3RvdGFsOiAodG90YWwpIC0+XG4gICAgQHhwX3RvdGFsID0gdG90YWxcbiAgICAkKCcueHAnKS5wcm9ncmVzc1xuICAgICAgdG90YWw6IEB4cF90b3RhbFxuICAgICAgdGV4dDpcbiAgICAgICAgYWN0aXZlOiBcIkxldmVsICN7QGxldmVsfSA6ICh7dmFsdWV9L3t0b3RhbH0pXCJcbiAgICAgICAgc3VjY2VzczogXCJMRVZFTCBVUCFcIlxuXG4gIGxldmVsX3VwOiAtPlxuICAgIEBzZXRfbGV2ZWwoQGxldmVsICsgMSlcbiAgICBAY3VyX3hwID0gMFxuXG4gIHNldF9tb25leTogKG1vbmV5KSAtPlxuICAgIEBtb25leSA9IG1vbmV5XG4gICAgJChcIi5tb25leVwiKS5odG1sKEBtb25leSlcblxuICAgIGNvbnNvbGUubG9nIFwiTW9uZXkgYWZ0ZXIgc2V0IDogI3tAbW9uZXl9XCJcbiAgICBpZiBAbW9uZXkgPiA1MFxuICAgICAgJChcIi50ZXJtaW5hbC1za2lsbFwiKS5zaG93KClcbiAgICBpZiBAbW9uZXkgPiAyMDAwXG4gICAgICAkKFwiLnJvYm90LXNraWxsXCIpLnNob3coKVxuXG4gIHNldF9sZXZlbDogKGxldmVsKSAtPlxuICAgIEBsZXZlbCA9IHBhcnNlSW50KGxldmVsKVxuICAgICQoXCIubGV2ZWxcIikuaHRtbChAbGV2ZWwpXG5cbiAgYnV5OiAoc2tpbGwpIC0+XG4gICAgY29uc29sZS5sb2cgXCJNb25leTogI3tAbW9uZXl9LCBza2lsbCBwcmljZTogI3tza2lsbC5wcmljZX1cIlxuICAgIGlmIEBtb25leSA+IHNraWxsLnByaWNlIGFuZCBza2lsbC5udW1iZXIgPCBza2lsbC5tYXhcbiAgICAgIEBzZXRfbW9uZXkoQG1vbmV5IC0gc2tpbGwucHJpY2UpXG4gICAgICBza2lsbC5pbmNyZWFzZV9udW1iZXIoKVxuICAgICAgQHNraWxsc1tza2lsbC5uYW1lXSA9IHNraWxsLm51bWJlclxuXG4gIGRlY19waXp6YTogLT5cbiAgICBAc2tpbGxzLnBpenphIC09IDFcblxuICBsb2FkOiAtPlxuICAgIHJldHVybiBpZiBsb2NhbFN0b3JhZ2UubmFtZSA9PSB1bmRlZmluZWRcbiAgICBAbmFtZSA9IGxvY2FsU3RvcmFnZS5uYW1lXG4gICAgQHNldF9tb25leShwYXJzZUludChsb2NhbFN0b3JhZ2UubW9uZXkpKVxuICAgIEBodW5ncnkgPSBsb2NhbFN0b3JhZ2UuaHVuZ3J5XG4gICAgQHRpcmVkID0gbG9jYWxTdG9yYWdlLnRpcmVkXG4gICAgQHNldF9sZXZlbChsb2NhbFN0b3JhZ2UubGV2ZWwpXG4gICAgQHN0YXR1cyA9IGxvY2FsU3RvcmFnZS5zdGF0dXNcbiAgICBpZiBsb2NhbFN0b3JhZ2Uuc2tpbGxzXG4gICAgICBAc2tpbGxzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Uuc2tpbGxzKVxuICAgICAgaWYgQHNraWxscy50ZXJtaW5hbCA+IDFcbiAgICAgICAgJCgnLndvcmtzcGFjZScpLmFwcGVuZCgnPHByZSBjbGFzcz1cImNvbnNvbGVcIj48L3ByZT4nKSBmb3IgaSBpbiBbMi4uQHNraWxscy50ZXJtaW5hbF1cbiAgICAgIGlmIEBza2lsbHMucm9ib3QgPiAwXG4gICAgICAgIHNldEludGVydmFsIC0+XG4gICAgICAgICAgJCgnLndvcmtzcGFjZScpLmtleXVwKClcbiAgICAgICAgLCAxMDAgZm9yIGkgaW4gWzEuLkBza2lsbHMucm9ib3RdXG5cblxuICBzYXZlOiAtPlxuICAgIGxvY2FsU3RvcmFnZS5uYW1lID0gQG5hbWVcbiAgICBsb2NhbFN0b3JhZ2UubW9uZXkgPSBAbW9uZXlcbiAgICBsb2NhbFN0b3JhZ2UuaHVuZ3J5ID0gQGh1bmdyeVxuICAgIGxvY2FsU3RvcmFnZS50aXJlZCA9IEB0aXJlZFxuICAgIGxvY2FsU3RvcmFnZS5sZXZlbCA9IEBsZXZlbFxuICAgIGxvY2FsU3RvcmFnZS5zdGF0dXMgPSBAc3RhdHVzXG4gICAgbG9jYWxTdG9yYWdlLnNraWxscyA9IEpTT04uc3RyaW5naWZ5KEBza2lsbHMpXG4iLCJjbGFzcyBAU2tpbGxcblxuICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBAcHJpY2UsIEBudW1iZXIsIEBtYXgsIEBjYWxsYmFjaykgLT5cbiAgICAkKFwiLiN7QG5hbWV9LXByaWNlXCIpLmh0bWwoQHByaWNlICsgJyQnKVxuICAgICQoXCIuI3tAbmFtZX0tbnVtYmVyXCIpLmh0bWwoQG51bWJlcilcbiAgICAkKFwiLiN7QG5hbWV9LW1heFwiKS5odG1sKEBtYXgpXG5cbiAgaW5jcmVhc2VfbnVtYmVyOiAtPlxuICAgIEBudW1iZXIgKz0gMVxuICAgIEBjYWxsYmFjaygpXG4gICAgJChcIi4je0BuYW1lfS1udW1iZXJcIikuaHRtbChAbnVtYmVyKVxuXG4gIGRlY3JlYXNlX251bWJlcjogPT5cbiAgICBAbnVtYmVyIC09IDFcbiAgICAkKFwiLiN7QG5hbWV9LW51bWJlclwiKS5odG1sKEBudW1iZXIpXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
