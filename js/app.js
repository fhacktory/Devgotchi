(function() {
  $(function() {
    var codeish, dev, game_running, level_up_modal, levels, load_file, load_level, name_input, new_game, skills, start_new_game, terminal;
    game_running = false;
    dev = new Dev($(".developer"));
    dev.load();
    codeish = '';
    terminal = $('.console');
    skills = {
      terminal: new Skill('terminal', 50, dev.skills.terminal, 10, function() {
        $('.workspace').append('<pre class="console"></pre>');
        return terminal = $('.console');
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
    if (dev.money < 50) {
      $('.skill').hide();
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
        terminal: 1
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
        return $(".terminal-skill").show();
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
      var i, j, ref, results;
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
          results = [];
          for (i = j = 2, ref = this.skills.terminal; 2 <= ref ? j <= ref : j >= ref; i = 2 <= ref ? ++j : --j) {
            results.push($('.workspace').append('<pre class="console"></pre>'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb2ZmZWUiLCJkZXZlbG9wZXIuY29mZmVlIiwic2tpbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsQ0FBQSxDQUFFLFNBQUE7QUFDQSxRQUFBO0lBQUEsWUFBQSxHQUFnQjtJQUNoQixHQUFBLEdBQW9CLElBQUEsR0FBQSxDQUFJLENBQUEsQ0FBRSxZQUFGLENBQUo7SUFDcEIsR0FBRyxDQUFDLElBQUosQ0FBQTtJQUNBLE9BQUEsR0FBZ0I7SUFDaEIsUUFBQSxHQUFnQixDQUFBLENBQUUsVUFBRjtJQUNoQixNQUFBLEdBQ0U7TUFBQSxRQUFBLEVBQWMsSUFBQSxLQUFBLENBQU0sVUFBTixFQUFrQixFQUFsQixFQUFzQixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQWpDLEVBQTJDLEVBQTNDLEVBQStDLFNBQUE7UUFDM0QsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLE1BQWhCLENBQXVCLDZCQUF2QjtlQUNBLFFBQUEsR0FBVyxDQUFBLENBQUUsVUFBRjtNQUZnRCxDQUEvQyxDQUFkOztJQUdGLFFBQUEsR0FBZ0IsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsQ0FBcUI7TUFBQSxRQUFBLEVBQVUsS0FBVjtLQUFyQjtJQUNoQixjQUFBLEdBQWdCLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxLQUFmLENBQUE7SUFDaEIsVUFBQSxHQUFnQixDQUFBLENBQUUsaUJBQUY7SUFDaEIsTUFBQSxHQUNFO01BQUEsQ0FBQSxFQUFHLFFBQUg7TUFDQSxDQUFBLEVBQUcsVUFESDtNQUVBLENBQUEsRUFBRyxTQUZIO01BR0EsQ0FBQSxFQUFHLFNBSEg7TUFJQSxDQUFBLEVBQUcsVUFKSDtNQUtBLENBQUEsRUFBRyxTQUxIOztJQU9GLElBQUcsR0FBRyxDQUFDLEtBQUosR0FBWSxFQUFmO01BQ0UsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLElBQVosQ0FBQSxFQURGOztJQUdBLFNBQUEsR0FBWSxTQUFDLFFBQUQ7YUFDVixD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QUN2QixZQUFZLENBQUMsS0FBYixHQUFxQixJQUFDLENBQUE7TUFDdEIsWUFBWSxDQUFDLEtBQWIsR0FBcUIsSUFBQyxDQUFBO01BQ3RCLFlBQVksQ0FBQyxNQUFiLEdBQXNCLElBQUMsQ0FBQTthQUN2QixZQUFZLENBQUMsTUFBYixHQUFzQixJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxNQUFoQjtJQVBsQjs7Ozs7QUFwRlI7OztBQ0FBO0VBQU0sSUFBQyxDQUFBO0lBRVEsZUFBQyxJQUFELEVBQVEsS0FBUixFQUFnQixNQUFoQixFQUF5QixHQUF6QixFQUErQixRQUEvQjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxNQUFEO01BQU0sSUFBQyxDQUFBLFdBQUQ7TUFDMUMsQ0FBQSxDQUFFLEdBQUEsR0FBSSxJQUFDLENBQUEsSUFBTCxHQUFVLFFBQVosQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixJQUFDLENBQUEsS0FBRCxHQUFTLEdBQW5DO01BQ0EsQ0FBQSxDQUFFLEdBQUEsR0FBSSxJQUFDLENBQUEsSUFBTCxHQUFVLFNBQVosQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixJQUFDLENBQUEsTUFBNUI7TUFDQSxDQUFBLENBQUUsR0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFMLEdBQVUsTUFBWixDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQUMsQ0FBQSxHQUF6QjtJQUhXOztvQkFLYixlQUFBLEdBQWlCLFNBQUE7TUFDZixJQUFDLENBQUEsTUFBRCxJQUFXO01BQ1gsSUFBQyxDQUFBLFFBQUQsQ0FBQTthQUNBLENBQUEsQ0FBRSxHQUFBLEdBQUksSUFBQyxDQUFBLElBQUwsR0FBVSxTQUFaLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsSUFBQyxDQUFBLE1BQTVCO0lBSGU7Ozs7O0FBUG5CIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiQgLT5cbiAgZ2FtZV9ydW5uaW5nICA9IGZhbHNlXG4gIGRldiAgICAgICAgICAgPSBuZXcgRGV2KCQoXCIuZGV2ZWxvcGVyXCIpKVxuICBkZXYubG9hZCgpXG4gIGNvZGVpc2ggICAgICAgPSAnJ1xuICB0ZXJtaW5hbCAgICAgID0gJCgnLmNvbnNvbGUnKVxuICBza2lsbHMgICAgICAgID1cbiAgICB0ZXJtaW5hbDogbmV3IFNraWxsKCd0ZXJtaW5hbCcsIDUwLCBkZXYuc2tpbGxzLnRlcm1pbmFsLCAxMCwgLT5cbiAgICAgICQoJy53b3Jrc3BhY2UnKS5hcHBlbmQoJzxwcmUgY2xhc3M9XCJjb25zb2xlXCI+PC9wcmU+JylcbiAgICAgIHRlcm1pbmFsID0gJCgnLmNvbnNvbGUnKSlcbiAgbmV3X2dhbWUgICAgICA9ICQoJy5uZXctZ2FtZScpLm1vZGFsKGNsb3NhYmxlOiBmYWxzZSlcbiAgbGV2ZWxfdXBfbW9kYWw9ICQoJy5sZXZlbC11cCcpLm1vZGFsKClcbiAgbmFtZV9pbnB1dCAgICA9ICQoJy5jaGFyYWN0ZXItbmFtZScpXG4gIGxldmVscyAgICAgICAgID1cbiAgICAwOiAnY29kZS5jJ1xuICAgIDE6ICdjb2RlLmNwcCdcbiAgICAyOiAnY29kZS5weSdcbiAgICAzOiAnY29kZS5yYidcbiAgICA0OiAnY29kZS5sdWEnXG4gICAgNTogJ2NvZGUuZ28nXG5cbiAgaWYgZGV2Lm1vbmV5IDwgNTBcbiAgICAkKCcuc2tpbGwnKS5oaWRlKClcblxuICBsb2FkX2ZpbGUgPSAoZmlsZW5hbWUpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IFwiY29kZV9zYW1wbGVzLyN7ZmlsZW5hbWV9XCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICBjb2RlaXNoID0gZGF0YVxuICAgICAgICBkZXYuc2V0X3hwX3RvdGFsKGNvZGVpc2gubGVuZ3RoKVxuXG4gIHN0YXJ0X25ld19nYW1lID0gLT5cbiAgICB1bmxlc3MgZGV2Lm5hbWVcbiAgICAgIG5ld19nYW1lLm1vZGFsKFwic2hvd1wiKVxuICAgICAgc3RhcnRfYnV0dG9uLm9uICdjbGljaycsIC0+XG4gICAgICAgIGRldi5uYW1lID0gbmFtZV9pbnB1dC52YWwoKVxuICAgICAgICBuZXdfZ2FtZS5tb2RhbChcImhpZGVcIilcbiAgICAgICAgbG9hZF9sZXZlbCgpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJChkb2N1bWVudCkua2V5dXAgKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZ2FtZV9ydW5uaW5nXG4gICAgZGV2LmNoYW5nZV9zdGF0dXMoXCJjb21wdXRpbmdcIilcbiAgICBkZXYub25fdHlwZSgpXG5cbiAgICB0ZXJtaW5hbC50ZXh0KGNvZGVpc2guc2xpY2UoMCwgZGV2LmN1cl94cCArIGRldi5pbmNyZW1lbnQpKVxuICAgIHRlcm1pbmFsLnNjcm9sbFRvcCh0ZXJtaW5hbFswXS5zY3JvbGxIZWlnaHQpXG5cbiAgICBpZiBkZXYuY3VyX3hwID4gZGV2LnhwX3RvdGFsXG4gICAgICBkZXYuY2hhbmdlX3N0YXR1cyhcInZpY3RvcnlcIilcbiAgICAgIGRldi5sZXZlbF91cCgpXG4gICAgICBsb2FkX2ZpbGUobGV2ZWxzW2Rldi5sZXZlbF0pXG4gICAgICB0ZXJtaW5hbC50ZXh0KFwiXCIpXG4gICAgICBsZXZlbF91cF9tb2RhbC5tb2RhbFxuICAgICAgICBvbkhpZGU6IC0+XG4gICAgICAgICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgICAgbGV2ZWxfdXBfbW9kYWwubW9kYWwgJ3Nob3cnXG4gICAgICBnYW1lX3J1bm5pbmcgPSBmYWxzZVxuXG4gICQoJy5uZXctZ2FtZS1zdGFydCcpLm9uICdjbGljaycsIC0+XG4gICAgZGV2Lm5hbWUgPSBuYW1lX2lucHV0LnZhbCgpXG4gICAgbmV3X2dhbWUubW9kYWwoXCJoaWRlXCIpXG4gICAgbG9hZF9sZXZlbCgpXG5cbiAgJCgnLnRlcm1pbmFsLWJ0bicpLm9uICdjbGljaycsIC0+XG4gICAgZGV2LmJ1eShza2lsbHMudGVybWluYWwpXG5cbiAgbG9hZF9sZXZlbCA9IC0+XG4gICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgIGxvYWRfZmlsZShsZXZlbHNbZGV2LmxldmVsXSlcblxuICBzdGFydF9uZXdfZ2FtZSgpXG5cbiAgc2V0SW50ZXJ2YWwgLT5cbiAgICBkZXYuc2F2ZSgpXG4gICwgNTAwMFxuIiwiRnVuY3Rpb246OnNldHRlciA9IChwcm9wLCBzZXQpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCB7c2V0LCBjb25maWd1cmFibGU6IHllc31cblxuY2xhc3MgQERldlxuICBhbmltYXRpb24gPVxuICAgIGRlZmF1bHQ6ICAgIFwiZGVmYXVsdC5wbmdcIlxuICAgIHZpY3Rvcnk6ICAgIFwidmljdG9yeS5naWZcIlxuICAgIGNvbXB1dGluZzogIFwiY29tcHV0aW5nLmdpZlwiXG5cbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IsIEBuYW1lKSAtPlxuICAgIEBzdGF0dXMgICAgID0gXCJkZWZhdWx0XCJcbiAgICBAbW9uZXkgICAgICA9IDBcbiAgICBAaHVuZ3J5ICAgICA9IDBcbiAgICBAdGlyZWQgICAgICA9IDBcbiAgICBAYWdlICAgICAgICA9IDBcbiAgICBAbGV2ZWwgICAgICA9IDBcbiAgICBAY3VyX3hwICAgICA9IDBcbiAgICBAeHBfdG90YWwgICA9IDBcbiAgICBAaW5jcmVtZW50ICA9IDFcbiAgICBAc2tpbGxzID1cbiAgICAgIHRlcm1pbmFsOiAxXG4gICAgQHNldF9tb25leShAbW9uZXkpXG4gICAgQHNldF9sZXZlbChAbGV2ZWwpXG5cbiAgb25fdHlwZTogLT5cbiAgICBAY3VyX3hwICs9IEBpbmNyZW1lbnRcbiAgICBAc2V0X21vbmV5KHBhcnNlSW50KEBtb25leSkgKyBAaW5jcmVtZW50ICogQHNraWxscy50ZXJtaW5hbClcbiAgICAkKCcueHAnKS5wcm9ncmVzcyAnaW5jcmVtZW50JywgQGluY3JlbWVudFxuXG4gIGNoYW5nZV9zdGF0dXM6IChzdGF0dXMpIC0+XG4gICAgQHN0YXR1cyA9IHN0YXR1c1xuICAgIEBhbmltYXRlKClcblxuICBhbmltYXRlOiAtPlxuICAgIG5ld19hbmltYXRpb25fdXJsID0gXCJhc3NldHMvZGV2ZWxvcGVyLyN7YW5pbWF0aW9uW0BzdGF0dXNdfVwiXG4gICAgb2xkX2FuaW1hdGlvbl91cmwgPSBAc2VsZWN0b3IuYXR0cihcInNyY1wiKVxuXG4gICAgaWYgbmV3X2FuaW1hdGlvbl91cmwgIT0gb2xkX2FuaW1hdGlvbl91cmxcbiAgICAgIEBzZWxlY3Rvci5hdHRyKFwic3JjXCIsIFwiYXNzZXRzL2RldmVsb3Blci8je2FuaW1hdGlvbltAc3RhdHVzXX1cIilcblxuICBzZXRfeHBfdG90YWw6ICh0b3RhbCkgLT5cbiAgICBAeHBfdG90YWwgPSB0b3RhbFxuICAgICQoJy54cCcpLnByb2dyZXNzXG4gICAgICB0b3RhbDogQHhwX3RvdGFsXG4gICAgICB0ZXh0OlxuICAgICAgICBhY3RpdmU6IFwiTGV2ZWwgI3tAbGV2ZWx9IDogKHt2YWx1ZX0ve3RvdGFsfSlcIlxuICAgICAgICBzdWNjZXNzOiBcIkxFVkVMIFVQIVwiXG5cbiAgbGV2ZWxfdXA6IC0+XG4gICAgQHNldF9sZXZlbChAbGV2ZWwgKyAxKVxuICAgIEBjdXJfeHAgPSAwXG5cbiAgc2V0X21vbmV5OiAobW9uZXkpIC0+XG4gICAgQG1vbmV5ID0gbW9uZXlcbiAgICAkKFwiLm1vbmV5XCIpLmh0bWwoQG1vbmV5KVxuXG4gICAgY29uc29sZS5sb2cgXCJNb25leSBhZnRlciBzZXQgOiAje0Btb25leX1cIlxuICAgIGlmIEBtb25leSA+IDUwXG4gICAgICAkKFwiLnRlcm1pbmFsLXNraWxsXCIpLnNob3coKVxuXG4gIHNldF9sZXZlbDogKGxldmVsKSAtPlxuICAgIEBsZXZlbCA9IGxldmVsXG4gICAgJChcIi5sZXZlbFwiKS5odG1sKEBsZXZlbClcblxuICBidXk6IChza2lsbCkgLT5cbiAgICBjb25zb2xlLmxvZyBcIk1vbmV5OiAje0Btb25leX0sIHNraWxsIHByaWNlOiAje3NraWxsLnByaWNlfVwiXG4gICAgaWYgQG1vbmV5ID4gc2tpbGwucHJpY2UgYW5kIHNraWxsLm51bWJlciA8IHNraWxsLm1heFxuICAgICAgQHNldF9tb25leShAbW9uZXkgLSBza2lsbC5wcmljZSlcbiAgICAgIHNraWxsLmluY3JlYXNlX251bWJlcigpXG4gICAgICBAc2tpbGxzW3NraWxsLm5hbWVdID0gc2tpbGwubnVtYmVyXG5cbiAgbG9hZDogLT5cbiAgICByZXR1cm4gaWYgbG9jYWxTdG9yYWdlLm5hbWUgPT0gdW5kZWZpbmVkXG4gICAgQG5hbWUgPSBsb2NhbFN0b3JhZ2UubmFtZVxuICAgIEBzZXRfbW9uZXkocGFyc2VJbnQobG9jYWxTdG9yYWdlLm1vbmV5KSlcbiAgICBAaHVuZ3J5ID0gbG9jYWxTdG9yYWdlLmh1bmdyeVxuICAgIEB0aXJlZCA9IGxvY2FsU3RvcmFnZS50aXJlZFxuICAgIEBzZXRfbGV2ZWwobG9jYWxTdG9yYWdlLmxldmVsKVxuICAgIEBzdGF0dXMgPSBsb2NhbFN0b3JhZ2Uuc3RhdHVzXG4gICAgaWYgbG9jYWxTdG9yYWdlLnNraWxsc1xuICAgICAgQHNraWxscyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLnNraWxscylcbiAgICAgIGlmIEBza2lsbHMudGVybWluYWwgPiAxXG4gICAgICAgICQoJy53b3Jrc3BhY2UnKS5hcHBlbmQoJzxwcmUgY2xhc3M9XCJjb25zb2xlXCI+PC9wcmU+JykgZm9yIGkgaW4gWzIuLkBza2lsbHMudGVybWluYWxdXG5cbiAgc2F2ZTogLT5cbiAgICBsb2NhbFN0b3JhZ2UubmFtZSA9IEBuYW1lXG4gICAgbG9jYWxTdG9yYWdlLm1vbmV5ID0gQG1vbmV5XG4gICAgbG9jYWxTdG9yYWdlLmh1bmdyeSA9IEBodW5ncnlcbiAgICBsb2NhbFN0b3JhZ2UudGlyZWQgPSBAdGlyZWRcbiAgICBsb2NhbFN0b3JhZ2UubGV2ZWwgPSBAbGV2ZWxcbiAgICBsb2NhbFN0b3JhZ2Uuc3RhdHVzID0gQHN0YXR1c1xuICAgIGxvY2FsU3RvcmFnZS5za2lsbHMgPSBKU09OLnN0cmluZ2lmeShAc2tpbGxzKVxuIiwiY2xhc3MgQFNraWxsXG5cbiAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByaWNlLCBAbnVtYmVyLCBAbWF4LCBAY2FsbGJhY2spIC0+XG4gICAgJChcIi4je0BuYW1lfS1wcmljZVwiKS5odG1sKEBwcmljZSArICckJylcbiAgICAkKFwiLiN7QG5hbWV9LW51bWJlclwiKS5odG1sKEBudW1iZXIpXG4gICAgJChcIi4je0BuYW1lfS1tYXhcIikuaHRtbChAbWF4KVxuXG4gIGluY3JlYXNlX251bWJlcjogLT5cbiAgICBAbnVtYmVyICs9IDFcbiAgICBAY2FsbGJhY2soKVxuICAgICQoXCIuI3tAbmFtZX0tbnVtYmVyXCIpLmh0bWwoQG51bWJlcilcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
