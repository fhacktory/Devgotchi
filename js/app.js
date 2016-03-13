(function() {
  $(function() {
    var codeish, dev, game_running, level_up_modal, levels, load_file, load_level, name_input, new_game, skills, start_new_game, terminal;
    game_running = false;
    dev = new Dev($(".developer"));
    skills = {
      terminal: new Skill('terminal', 50, 1)
    };
    codeish = '';
    terminal = $('.console');
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
    $('.skill').hide();
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
      dev.load();
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
      this.increment = 20;
      this.skills = {
        terminal: 1
      };
      this.set_money(this.money);
      this.set_level(this.level);
    }

    Dev.prototype.on_type = function() {
      this.cur_xp += this.increment;
      this.set_money(parseInt(this.money) + this.increment);
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
      if (this.money > 50) {
        return $(".terminal-skill").show();
      }
    };

    Dev.prototype.set_level = function(level) {
      this.level = level;
      return $(".level").html(this.level);
    };

    Dev.prototype.buy = function(skill) {
      console.log("Money: " + this.money + ", skill price: " + skill.price);
      if (this.money > skill.price) {
        this.set_money(this.money - skill.price);
        skill.increase_number();
        return this.skills[skill.name] = skill.number;
      }
    };

    Dev.prototype.load = function() {
      if (localStorage.name === void 0) {
        return;
      }
      this.name = localStorage.name;
      this.set_money(localStorage.money);
      this.hungry = localStorage.hungry;
      this.tired = localStorage.tired;
      this.set_level(localStorage.level);
      this.status = localStorage.status;
      if (localStorage.skills) {
        return this.skills = JSON.parse(localStorage.skills);
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
    function Skill(name, price, number) {
      this.name = name;
      this.price = price;
      this.number = number;
      $("." + this.name + "-price").html(this.price + '$');
      $("." + this.name + "-number").html(this.number);
    }

    Skill.prototype.increase_number = function() {
      this.number += 1;
      return $("." + this.name + "-number").html(this.number);
    };

    return Skill;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb2ZmZWUiLCJkZXZlbG9wZXIuY29mZmVlIiwic2tpbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsQ0FBQSxDQUFFLFNBQUE7QUFDQSxRQUFBO0lBQUEsWUFBQSxHQUFnQjtJQUNoQixHQUFBLEdBQW9CLElBQUEsR0FBQSxDQUFJLENBQUEsQ0FBRSxZQUFGLENBQUo7SUFDcEIsTUFBQSxHQUNFO01BQUEsUUFBQSxFQUFjLElBQUEsS0FBQSxDQUFNLFVBQU4sRUFBa0IsRUFBbEIsRUFBc0IsQ0FBdEIsQ0FBZDs7SUFDRixPQUFBLEdBQWdCO0lBQ2hCLFFBQUEsR0FBZ0IsQ0FBQSxDQUFFLFVBQUY7SUFDaEIsUUFBQSxHQUFnQixDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsS0FBZixDQUFxQjtNQUFBLFFBQUEsRUFBVSxLQUFWO0tBQXJCO0lBQ2hCLGNBQUEsR0FBZ0IsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsQ0FBQTtJQUNoQixVQUFBLEdBQWdCLENBQUEsQ0FBRSxpQkFBRjtJQUNoQixNQUFBLEdBQ0U7TUFBQSxDQUFBLEVBQUcsUUFBSDtNQUNBLENBQUEsRUFBRyxVQURIO01BRUEsQ0FBQSxFQUFHLFNBRkg7TUFHQSxDQUFBLEVBQUcsU0FISDtNQUlBLENBQUEsRUFBRyxVQUpIO01BS0EsQ0FBQSxFQUFHLFNBTEg7O0lBT0YsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLElBQVosQ0FBQTtJQUVBLFNBQUEsR0FBWSxTQUFDLFFBQUQ7YUFDVixDQUFDLENBQUMsSUFBRixDQUNFO1FBQUEsR0FBQSxFQUFLLGVBQUEsR0FBZ0IsUUFBckI7UUFDQSxPQUFBLEVBQVMsU0FBQyxJQUFEO1VBQ1AsT0FBQSxHQUFVO2lCQUNWLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQU8sQ0FBQyxNQUF6QjtRQUZPLENBRFQ7T0FERjtJQURVO0lBT1osY0FBQSxHQUFpQixTQUFBO01BQ2YsR0FBRyxDQUFDLElBQUosQ0FBQTtNQUNBLElBQUEsQ0FBTyxHQUFHLENBQUMsSUFBWDtRQUNFLFFBQVEsQ0FBQyxLQUFULENBQWUsTUFBZjtRQUNBLFlBQVksQ0FBQyxFQUFiLENBQWdCLE9BQWhCLEVBQXlCLFNBQUE7VUFDdkIsR0FBRyxDQUFDLElBQUosR0FBVyxVQUFVLENBQUMsR0FBWCxDQUFBO1VBQ1gsUUFBUSxDQUFDLEtBQVQsQ0FBZSxNQUFmO2lCQUNBLFVBQUEsQ0FBQTtRQUh1QixDQUF6QixFQUZGOzthQU1BLFVBQUEsQ0FBQTtJQVJlO0lBVWpCLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLFNBQUMsS0FBRDtNQUNoQixJQUFBLENBQWMsWUFBZDtBQUFBLGVBQUE7O01BQ0EsR0FBRyxDQUFDLGFBQUosQ0FBa0IsV0FBbEI7TUFDQSxHQUFHLENBQUMsT0FBSixDQUFBO01BRUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxPQUFPLENBQUMsS0FBUixDQUFjLENBQWQsRUFBaUIsR0FBRyxDQUFDLE1BQUosR0FBYSxHQUFHLENBQUMsU0FBbEMsQ0FBZDtNQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUEvQjtNQUVBLElBQUcsR0FBRyxDQUFDLE1BQUosR0FBYSxHQUFHLENBQUMsUUFBcEI7UUFDRSxHQUFHLENBQUMsYUFBSixDQUFrQixTQUFsQjtRQUNBLEdBQUcsQ0FBQyxRQUFKLENBQUE7UUFDQSxTQUFBLENBQVUsTUFBTyxDQUFBLEdBQUcsQ0FBQyxLQUFKLENBQWpCO1FBQ0EsUUFBUSxDQUFDLElBQVQsQ0FBYyxFQUFkO1FBQ0EsY0FBYyxDQUFDLEtBQWYsQ0FDRTtVQUFBLE1BQUEsRUFBUSxTQUFBO21CQUNOLFlBQUEsR0FBZTtVQURULENBQVI7U0FERjtRQUdBLGNBQWMsQ0FBQyxLQUFmLENBQXFCLE1BQXJCO2VBQ0EsWUFBQSxHQUFlLE1BVGpCOztJQVJnQixDQUFsQjtJQW1CQSxDQUFBLENBQUUsaUJBQUYsQ0FBb0IsQ0FBQyxFQUFyQixDQUF3QixPQUF4QixFQUFpQyxTQUFBO01BQy9CLEdBQUcsQ0FBQyxJQUFKLEdBQVcsVUFBVSxDQUFDLEdBQVgsQ0FBQTtNQUNYLFFBQVEsQ0FBQyxLQUFULENBQWUsTUFBZjthQUNBLFVBQUEsQ0FBQTtJQUgrQixDQUFqQztJQUtBLENBQUEsQ0FBRSxlQUFGLENBQWtCLENBQUMsRUFBbkIsQ0FBc0IsT0FBdEIsRUFBK0IsU0FBQTthQUM3QixHQUFHLENBQUMsR0FBSixDQUFRLE1BQU0sQ0FBQyxRQUFmO0lBRDZCLENBQS9CO0lBR0EsVUFBQSxHQUFhLFNBQUE7TUFDWCxZQUFBLEdBQWU7YUFDZixTQUFBLENBQVUsTUFBTyxDQUFBLEdBQUcsQ0FBQyxLQUFKLENBQWpCO0lBRlc7SUFJYixjQUFBLENBQUE7V0FFQSxXQUFBLENBQVksU0FBQTthQUNWLEdBQUcsQ0FBQyxJQUFKLENBQUE7SUFEVSxDQUFaLEVBRUUsSUFGRjtFQXRFQSxDQUFGO0FBQUE7OztBQ0FBO0VBQUEsUUFBUSxDQUFBLFNBQUUsQ0FBQSxNQUFWLEdBQW1CLFNBQUMsSUFBRCxFQUFPLEdBQVA7V0FDakIsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsSUFBQyxDQUFBLFNBQXZCLEVBQWtDLElBQWxDLEVBQXdDO01BQUMsS0FBQSxHQUFEO01BQU0sWUFBQSxFQUFjLElBQXBCO0tBQXhDO0VBRGlCOztFQUdiLElBQUMsQ0FBQTtBQUNMLFFBQUE7O0lBQUEsU0FBQSxHQUNFO01BQUEsU0FBQSxFQUFZLGFBQVo7TUFDQSxPQUFBLEVBQVksYUFEWjtNQUVBLFNBQUEsRUFBWSxlQUZaOzs7SUFJVyxhQUFDLFFBQUQsRUFBWSxJQUFaO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFBVyxJQUFDLENBQUEsT0FBRDtNQUN2QixJQUFDLENBQUEsTUFBRCxHQUFjO01BQ2QsSUFBQyxDQUFBLEtBQUQsR0FBYztNQUNkLElBQUMsQ0FBQSxNQUFELEdBQWM7TUFDZCxJQUFDLENBQUEsS0FBRCxHQUFjO01BQ2QsSUFBQyxDQUFBLEdBQUQsR0FBYztNQUNkLElBQUMsQ0FBQSxLQUFELEdBQWM7TUFDZCxJQUFDLENBQUEsTUFBRCxHQUFjO01BQ2QsSUFBQyxDQUFBLFFBQUQsR0FBYztNQUNkLElBQUMsQ0FBQSxTQUFELEdBQWM7TUFDZCxJQUFDLENBQUEsTUFBRCxHQUNFO1FBQUEsUUFBQSxFQUFVLENBQVY7O01BQ0YsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsS0FBWjtNQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEtBQVo7SUFiVzs7a0JBZWIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsTUFBRCxJQUFXLElBQUMsQ0FBQTtNQUNaLElBQUMsQ0FBQSxTQUFELENBQVcsUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFWLENBQUEsR0FBbUIsSUFBQyxDQUFBLFNBQS9CO2FBQ0EsQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLFFBQVQsQ0FBa0IsV0FBbEIsRUFBK0IsSUFBQyxDQUFBLFNBQWhDO0lBSE87O2tCQUtULGFBQUEsR0FBZSxTQUFDLE1BQUQ7TUFDYixJQUFDLENBQUEsTUFBRCxHQUFVO2FBQ1YsSUFBQyxDQUFBLE9BQUQsQ0FBQTtJQUZhOztrQkFJZixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxpQkFBQSxHQUFvQixtQkFBQSxHQUFvQixTQUFVLENBQUEsSUFBQyxDQUFBLE1BQUQ7TUFDbEQsaUJBQUEsR0FBb0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsS0FBZjtNQUVwQixJQUFHLGlCQUFBLEtBQXFCLGlCQUF4QjtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLEtBQWYsRUFBc0IsbUJBQUEsR0FBb0IsU0FBVSxDQUFBLElBQUMsQ0FBQSxNQUFELENBQXBELEVBREY7O0lBSk87O2tCQU9ULFlBQUEsR0FBYyxTQUFDLEtBQUQ7TUFDWixJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLFFBQVQsQ0FDRTtRQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsUUFBUjtRQUNBLElBQUEsRUFDRTtVQUFBLE1BQUEsRUFBUSxRQUFBLEdBQVMsSUFBQyxDQUFBLEtBQVYsR0FBZ0Isc0JBQXhCO1VBQ0EsT0FBQSxFQUFTLFdBRFQ7U0FGRjtPQURGO0lBRlk7O2tCQVFkLFFBQUEsR0FBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsS0FBRCxHQUFTLENBQXBCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUZGOztrQkFJVixTQUFBLEdBQVcsU0FBQyxLQUFEO01BQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUNULENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxLQUFsQjtNQUVBLElBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFaO2VBQ0UsQ0FBQSxDQUFFLGlCQUFGLENBQW9CLENBQUMsSUFBckIsQ0FBQSxFQURGOztJQUpTOztrQkFPWCxTQUFBLEdBQVcsU0FBQyxLQUFEO01BQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxLQUFsQjtJQUZTOztrQkFJWCxHQUFBLEdBQUssU0FBQyxLQUFEO01BQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFBLEdBQVUsSUFBQyxDQUFBLEtBQVgsR0FBaUIsaUJBQWpCLEdBQWtDLEtBQUssQ0FBQyxLQUFwRDtNQUNBLElBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUFLLENBQUMsS0FBbEI7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FBSyxDQUFDLEtBQTFCO1FBQ0EsS0FBSyxDQUFDLGVBQU4sQ0FBQTtlQUNBLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBUixHQUFzQixLQUFLLENBQUMsT0FIOUI7O0lBRkc7O2tCQU9MLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBVSxZQUFZLENBQUMsSUFBYixLQUFxQixNQUEvQjtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxZQUFZLENBQUM7TUFDckIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxZQUFZLENBQUMsS0FBeEI7TUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLFlBQVksQ0FBQztNQUN2QixJQUFDLENBQUEsS0FBRCxHQUFTLFlBQVksQ0FBQztNQUN0QixJQUFDLENBQUEsU0FBRCxDQUFXLFlBQVksQ0FBQyxLQUF4QjtNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsWUFBWSxDQUFDO01BQ3ZCLElBQUcsWUFBWSxDQUFDLE1BQWhCO2VBQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLFlBQVksQ0FBQyxNQUF4QixFQURaOztJQVJJOztrQkFXTixJQUFBLEdBQU0sU0FBQTtNQUNKLFlBQVksQ0FBQyxJQUFiLEdBQW9CLElBQUMsQ0FBQTtNQUNyQixZQUFZLENBQUMsS0FBYixHQUFxQixJQUFDLENBQUE7TUFDdEIsWUFBWSxDQUFDLE1BQWIsR0FBc0IsSUFBQyxDQUFBO01BQ3ZCLFlBQVksQ0FBQyxLQUFiLEdBQXFCLElBQUMsQ0FBQTtNQUN0QixZQUFZLENBQUMsS0FBYixHQUFxQixJQUFDLENBQUE7TUFDdEIsWUFBWSxDQUFDLE1BQWIsR0FBc0IsSUFBQyxDQUFBO2FBQ3ZCLFlBQVksQ0FBQyxNQUFiLEdBQXNCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE1BQWhCO0lBUGxCOzs7OztBQWpGUjs7O0FDQUE7RUFBTSxJQUFDLENBQUE7SUFFUSxlQUFDLElBQUQsRUFBUSxLQUFSLEVBQWdCLE1BQWhCO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsUUFBRDtNQUFRLElBQUMsQ0FBQSxTQUFEO01BQzNCLENBQUEsQ0FBRSxHQUFBLEdBQUksSUFBQyxDQUFBLElBQUwsR0FBVSxRQUFaLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsSUFBQyxDQUFBLEtBQUQsR0FBUyxHQUFuQztNQUNBLENBQUEsQ0FBRSxHQUFBLEdBQUksSUFBQyxDQUFBLElBQUwsR0FBVSxTQUFaLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsSUFBQyxDQUFBLE1BQTVCO0lBRlc7O29CQUliLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQUMsQ0FBQSxNQUFELElBQVc7YUFDWCxDQUFBLENBQUUsR0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFMLEdBQVUsU0FBWixDQUFxQixDQUFDLElBQXRCLENBQTJCLElBQUMsQ0FBQSxNQUE1QjtJQUZlOzs7OztBQU5uQiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkIC0+XG4gIGdhbWVfcnVubmluZyAgPSBmYWxzZVxuICBkZXYgICAgICAgICAgID0gbmV3IERldigkKFwiLmRldmVsb3BlclwiKSlcbiAgc2tpbGxzICAgICAgICA9XG4gICAgdGVybWluYWw6IG5ldyBTa2lsbCgndGVybWluYWwnLCA1MCwgMSlcbiAgY29kZWlzaCAgICAgICA9ICcnXG4gIHRlcm1pbmFsICAgICAgPSAkKCcuY29uc29sZScpXG4gIG5ld19nYW1lICAgICAgPSAkKCcubmV3LWdhbWUnKS5tb2RhbChjbG9zYWJsZTogZmFsc2UpXG4gIGxldmVsX3VwX21vZGFsPSAkKCcubGV2ZWwtdXAnKS5tb2RhbCgpXG4gIG5hbWVfaW5wdXQgICAgPSAkKCcuY2hhcmFjdGVyLW5hbWUnKVxuICBsZXZlbHMgICAgICAgICA9XG4gICAgMDogJ2NvZGUuYydcbiAgICAxOiAnY29kZS5jcHAnXG4gICAgMjogJ2NvZGUucHknXG4gICAgMzogJ2NvZGUucmInXG4gICAgNDogJ2NvZGUubHVhJ1xuICAgIDU6ICdjb2RlLmdvJ1xuXG4gICQoJy5za2lsbCcpLmhpZGUoKVxuXG4gIGxvYWRfZmlsZSA9IChmaWxlbmFtZSkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogXCJjb2RlX3NhbXBsZXMvI3tmaWxlbmFtZX1cIlxuICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgIGNvZGVpc2ggPSBkYXRhXG4gICAgICAgIGRldi5zZXRfeHBfdG90YWwoY29kZWlzaC5sZW5ndGgpXG5cbiAgc3RhcnRfbmV3X2dhbWUgPSAtPlxuICAgIGRldi5sb2FkKClcbiAgICB1bmxlc3MgZGV2Lm5hbWVcbiAgICAgIG5ld19nYW1lLm1vZGFsKFwic2hvd1wiKVxuICAgICAgc3RhcnRfYnV0dG9uLm9uICdjbGljaycsIC0+XG4gICAgICAgIGRldi5uYW1lID0gbmFtZV9pbnB1dC52YWwoKVxuICAgICAgICBuZXdfZ2FtZS5tb2RhbChcImhpZGVcIilcbiAgICAgICAgbG9hZF9sZXZlbCgpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJChkb2N1bWVudCkua2V5dXAgKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZ2FtZV9ydW5uaW5nXG4gICAgZGV2LmNoYW5nZV9zdGF0dXMoXCJjb21wdXRpbmdcIilcbiAgICBkZXYub25fdHlwZSgpXG5cbiAgICB0ZXJtaW5hbC50ZXh0KGNvZGVpc2guc2xpY2UoMCwgZGV2LmN1cl94cCArIGRldi5pbmNyZW1lbnQpKVxuICAgIHRlcm1pbmFsLnNjcm9sbFRvcCh0ZXJtaW5hbFswXS5zY3JvbGxIZWlnaHQpXG5cbiAgICBpZiBkZXYuY3VyX3hwID4gZGV2LnhwX3RvdGFsXG4gICAgICBkZXYuY2hhbmdlX3N0YXR1cyhcInZpY3RvcnlcIilcbiAgICAgIGRldi5sZXZlbF91cCgpXG4gICAgICBsb2FkX2ZpbGUobGV2ZWxzW2Rldi5sZXZlbF0pXG4gICAgICB0ZXJtaW5hbC50ZXh0KFwiXCIpXG4gICAgICBsZXZlbF91cF9tb2RhbC5tb2RhbFxuICAgICAgICBvbkhpZGU6IC0+XG4gICAgICAgICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgICAgbGV2ZWxfdXBfbW9kYWwubW9kYWwgJ3Nob3cnXG4gICAgICBnYW1lX3J1bm5pbmcgPSBmYWxzZVxuXG4gICQoJy5uZXctZ2FtZS1zdGFydCcpLm9uICdjbGljaycsIC0+XG4gICAgZGV2Lm5hbWUgPSBuYW1lX2lucHV0LnZhbCgpXG4gICAgbmV3X2dhbWUubW9kYWwoXCJoaWRlXCIpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJCgnLnRlcm1pbmFsLWJ0bicpLm9uICdjbGljaycsIC0+XG4gICAgZGV2LmJ1eShza2lsbHMudGVybWluYWwpXG5cbiAgbG9hZF9sZXZlbCA9IC0+XG4gICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgIGxvYWRfZmlsZShsZXZlbHNbZGV2LmxldmVsXSlcblxuICBzdGFydF9uZXdfZ2FtZSgpXG5cbiAgc2V0SW50ZXJ2YWwgLT5cbiAgICBkZXYuc2F2ZSgpXG4gICwgNTAwMFxuIiwiRnVuY3Rpb246OnNldHRlciA9IChwcm9wLCBzZXQpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCB7c2V0LCBjb25maWd1cmFibGU6IHllc31cblxuY2xhc3MgQERldlxuICBhbmltYXRpb24gPVxuICAgIGRlZmF1bHQ6ICAgIFwiZGVmYXVsdC5wbmdcIlxuICAgIHZpY3Rvcnk6ICAgIFwidmljdG9yeS5naWZcIlxuICAgIGNvbXB1dGluZzogIFwiY29tcHV0aW5nLmdpZlwiXG5cbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IsIEBuYW1lKSAtPlxuICAgIEBzdGF0dXMgICAgID0gXCJkZWZhdWx0XCJcbiAgICBAbW9uZXkgICAgICA9IDBcbiAgICBAaHVuZ3J5ICAgICA9IDBcbiAgICBAdGlyZWQgICAgICA9IDBcbiAgICBAYWdlICAgICAgICA9IDBcbiAgICBAbGV2ZWwgICAgICA9IDBcbiAgICBAY3VyX3hwICAgICA9IDBcbiAgICBAeHBfdG90YWwgICA9IDBcbiAgICBAaW5jcmVtZW50ICA9IDIwXG4gICAgQHNraWxscyA9XG4gICAgICB0ZXJtaW5hbDogMVxuICAgIEBzZXRfbW9uZXkoQG1vbmV5KVxuICAgIEBzZXRfbGV2ZWwoQGxldmVsKVxuXG4gIG9uX3R5cGU6IC0+XG4gICAgQGN1cl94cCArPSBAaW5jcmVtZW50XG4gICAgQHNldF9tb25leShwYXJzZUludChAbW9uZXkpICsgQGluY3JlbWVudClcbiAgICAkKCcueHAnKS5wcm9ncmVzcyAnaW5jcmVtZW50JywgQGluY3JlbWVudFxuXG4gIGNoYW5nZV9zdGF0dXM6IChzdGF0dXMpIC0+XG4gICAgQHN0YXR1cyA9IHN0YXR1c1xuICAgIEBhbmltYXRlKClcblxuICBhbmltYXRlOiAtPlxuICAgIG5ld19hbmltYXRpb25fdXJsID0gXCJhc3NldHMvZGV2ZWxvcGVyLyN7YW5pbWF0aW9uW0BzdGF0dXNdfVwiXG4gICAgb2xkX2FuaW1hdGlvbl91cmwgPSBAc2VsZWN0b3IuYXR0cihcInNyY1wiKVxuXG4gICAgaWYgbmV3X2FuaW1hdGlvbl91cmwgIT0gb2xkX2FuaW1hdGlvbl91cmxcbiAgICAgIEBzZWxlY3Rvci5hdHRyKFwic3JjXCIsIFwiYXNzZXRzL2RldmVsb3Blci8je2FuaW1hdGlvbltAc3RhdHVzXX1cIilcblxuICBzZXRfeHBfdG90YWw6ICh0b3RhbCkgLT5cbiAgICBAeHBfdG90YWwgPSB0b3RhbFxuICAgICQoJy54cCcpLnByb2dyZXNzXG4gICAgICB0b3RhbDogQHhwX3RvdGFsXG4gICAgICB0ZXh0OlxuICAgICAgICBhY3RpdmU6IFwiTGV2ZWwgI3tAbGV2ZWx9IDogKHt2YWx1ZX0ve3RvdGFsfSlcIlxuICAgICAgICBzdWNjZXNzOiBcIkxFVkVMIFVQIVwiXG5cbiAgbGV2ZWxfdXA6IC0+XG4gICAgQHNldF9sZXZlbChAbGV2ZWwgKyAxKVxuICAgIEBjdXJfeHAgPSAwXG5cbiAgc2V0X21vbmV5OiAobW9uZXkpIC0+XG4gICAgQG1vbmV5ID0gbW9uZXlcbiAgICAkKFwiLm1vbmV5XCIpLmh0bWwoQG1vbmV5KVxuXG4gICAgaWYgQG1vbmV5ID4gNTBcbiAgICAgICQoXCIudGVybWluYWwtc2tpbGxcIikuc2hvdygpXG5cbiAgc2V0X2xldmVsOiAobGV2ZWwpIC0+XG4gICAgQGxldmVsID0gbGV2ZWxcbiAgICAkKFwiLmxldmVsXCIpLmh0bWwoQGxldmVsKVxuXG4gIGJ1eTogKHNraWxsKSAtPlxuICAgIGNvbnNvbGUubG9nIFwiTW9uZXk6ICN7QG1vbmV5fSwgc2tpbGwgcHJpY2U6ICN7c2tpbGwucHJpY2V9XCJcbiAgICBpZiBAbW9uZXkgPiBza2lsbC5wcmljZVxuICAgICAgQHNldF9tb25leShAbW9uZXkgLSBza2lsbC5wcmljZSlcbiAgICAgIHNraWxsLmluY3JlYXNlX251bWJlcigpXG4gICAgICBAc2tpbGxzW3NraWxsLm5hbWVdID0gc2tpbGwubnVtYmVyXG5cbiAgbG9hZDogLT5cbiAgICByZXR1cm4gaWYgbG9jYWxTdG9yYWdlLm5hbWUgPT0gdW5kZWZpbmVkXG4gICAgQG5hbWUgPSBsb2NhbFN0b3JhZ2UubmFtZVxuICAgIEBzZXRfbW9uZXkobG9jYWxTdG9yYWdlLm1vbmV5KVxuICAgIEBodW5ncnkgPSBsb2NhbFN0b3JhZ2UuaHVuZ3J5XG4gICAgQHRpcmVkID0gbG9jYWxTdG9yYWdlLnRpcmVkXG4gICAgQHNldF9sZXZlbChsb2NhbFN0b3JhZ2UubGV2ZWwpXG4gICAgQHN0YXR1cyA9IGxvY2FsU3RvcmFnZS5zdGF0dXNcbiAgICBpZiBsb2NhbFN0b3JhZ2Uuc2tpbGxzXG4gICAgICBAc2tpbGxzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Uuc2tpbGxzKVxuXG4gIHNhdmU6IC0+XG4gICAgbG9jYWxTdG9yYWdlLm5hbWUgPSBAbmFtZVxuICAgIGxvY2FsU3RvcmFnZS5tb25leSA9IEBtb25leVxuICAgIGxvY2FsU3RvcmFnZS5odW5ncnkgPSBAaHVuZ3J5XG4gICAgbG9jYWxTdG9yYWdlLnRpcmVkID0gQHRpcmVkXG4gICAgbG9jYWxTdG9yYWdlLmxldmVsID0gQGxldmVsXG4gICAgbG9jYWxTdG9yYWdlLnN0YXR1cyA9IEBzdGF0dXNcbiAgICBsb2NhbFN0b3JhZ2Uuc2tpbGxzID0gSlNPTi5zdHJpbmdpZnkoQHNraWxscylcbiIsImNsYXNzIEBTa2lsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcmljZSwgQG51bWJlcikgLT5cbiAgICAkKFwiLiN7QG5hbWV9LXByaWNlXCIpLmh0bWwoQHByaWNlICsgJyQnKVxuICAgICQoXCIuI3tAbmFtZX0tbnVtYmVyXCIpLmh0bWwoQG51bWJlcilcblxuICBpbmNyZWFzZV9udW1iZXI6IC0+XG4gICAgQG51bWJlciArPSAxXG4gICAgJChcIi4je0BuYW1lfS1udW1iZXJcIikuaHRtbChAbnVtYmVyKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
