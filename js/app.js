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
      terminal.append(codeish.slice(dev.cur_xp, dev.cur_xp + dev.increment));
      terminal.scrollTop(terminal[0].scrollHeight);
      if (dev.cur_xp > dev.xp_total) {
        dev.change_status("victory");
        dev.level_up();
        load_file(levels[dev.level]);
        terminal.html("");
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
      this.cur_xp = 0;
      return $(".score").html(this.level);
    };

    Dev.prototype.set_money = function(money) {
      this.money = money;
      return $(".money").html(this.money);
    };

    Dev.prototype.set_level = function(level) {
      this.level = level;
      return $(".level").html(this.level);
    };

    Dev.prototype.buy = function(skill) {
      console.log("Money: " + this.money + ", skill price: " + skill.price);
      if (this.money > skill.price) {
        this.set_money(this.money - skill.price);
        return skill.increase_number();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb2ZmZWUiLCJkZXZlbG9wZXIuY29mZmVlIiwic2tpbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsQ0FBQSxDQUFFLFNBQUE7QUFDQSxRQUFBO0lBQUEsWUFBQSxHQUFnQjtJQUNoQixHQUFBLEdBQW9CLElBQUEsR0FBQSxDQUFJLENBQUEsQ0FBRSxZQUFGLENBQUo7SUFDcEIsTUFBQSxHQUNFO01BQUEsUUFBQSxFQUFjLElBQUEsS0FBQSxDQUFNLFVBQU4sRUFBa0IsRUFBbEIsRUFBc0IsQ0FBdEIsQ0FBZDs7SUFDRixPQUFBLEdBQWdCO0lBQ2hCLFFBQUEsR0FBZ0IsQ0FBQSxDQUFFLFVBQUY7SUFDaEIsUUFBQSxHQUFnQixDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsS0FBZixDQUFxQjtNQUFBLFFBQUEsRUFBVSxLQUFWO0tBQXJCO0lBQ2hCLGNBQUEsR0FBZ0IsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsQ0FBQTtJQUNoQixVQUFBLEdBQWdCLENBQUEsQ0FBRSxpQkFBRjtJQUNoQixNQUFBLEdBQ0U7TUFBQSxDQUFBLEVBQUcsUUFBSDtNQUNBLENBQUEsRUFBRyxVQURIO01BRUEsQ0FBQSxFQUFHLFNBRkg7TUFHQSxDQUFBLEVBQUcsU0FISDtNQUlBLENBQUEsRUFBRyxVQUpIO01BS0EsQ0FBQSxFQUFHLFNBTEg7O0lBT0YsU0FBQSxHQUFZLFNBQUMsUUFBRDthQUNWLENBQUMsQ0FBQyxJQUFGLENBQ0U7UUFBQSxHQUFBLEVBQUssZUFBQSxHQUFnQixRQUFyQjtRQUNBLE9BQUEsRUFBUyxTQUFDLElBQUQ7VUFDUCxPQUFBLEdBQVU7aUJBQ1YsR0FBRyxDQUFDLFlBQUosQ0FBaUIsT0FBTyxDQUFDLE1BQXpCO1FBRk8sQ0FEVDtPQURGO0lBRFU7SUFPWixjQUFBLEdBQWlCLFNBQUE7TUFDZixHQUFHLENBQUMsSUFBSixDQUFBO01BQ0EsSUFBQSxDQUFPLEdBQUcsQ0FBQyxJQUFYO1FBQ0UsUUFBUSxD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Ozs7O0FBTm5CIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiQgLT5cbiAgZ2FtZV9ydW5uaW5nICA9IGZhbHNlXG4gIGRldiAgICAgICAgICAgPSBuZXcgRGV2KCQoXCIuZGV2ZWxvcGVyXCIpKVxuICBza2lsbHMgICAgICAgID1cbiAgICB0ZXJtaW5hbDogbmV3IFNraWxsKCd0ZXJtaW5hbCcsIDUwLCAxKVxuICBjb2RlaXNoICAgICAgID0gJydcbiAgdGVybWluYWwgICAgICA9ICQoJy5jb25zb2xlJylcbiAgbmV3X2dhbWUgICAgICA9ICQoJy5uZXctZ2FtZScpLm1vZGFsKGNsb3NhYmxlOiBmYWxzZSlcbiAgbGV2ZWxfdXBfbW9kYWw9ICQoJy5sZXZlbC11cCcpLm1vZGFsKClcbiAgbmFtZV9pbnB1dCAgICA9ICQoJy5jaGFyYWN0ZXItbmFtZScpXG4gIGxldmVscyAgICAgICAgID1cbiAgICAwOiAnY29kZS5jJ1xuICAgIDE6ICdjb2RlLmNwcCdcbiAgICAyOiAnY29kZS5weSdcbiAgICAzOiAnY29kZS5yYidcbiAgICA0OiAnY29kZS5sdWEnXG4gICAgNTogJ2NvZGUuZ28nXG5cbiAgbG9hZF9maWxlID0gKGZpbGVuYW1lKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBcImNvZGVfc2FtcGxlcy8je2ZpbGVuYW1lfVwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgY29kZWlzaCA9IGRhdGFcbiAgICAgICAgZGV2LnNldF94cF90b3RhbChjb2RlaXNoLmxlbmd0aClcblxuICBzdGFydF9uZXdfZ2FtZSA9IC0+XG4gICAgZGV2LmxvYWQoKVxuICAgIHVubGVzcyBkZXYubmFtZVxuICAgICAgbmV3X2dhbWUubW9kYWwoXCJzaG93XCIpXG4gICAgICBzdGFydF9idXR0b24ub24gJ2NsaWNrJywgLT5cbiAgICAgICAgZGV2Lm5hbWUgPSBuYW1lX2lucHV0LnZhbCgpXG4gICAgICAgIG5ld19nYW1lLm1vZGFsKFwiaGlkZVwiKVxuICAgICAgICBsb2FkX2xldmVsKClcbiAgICBsb2FkX2xldmVsKClcblxuICAkKGRvY3VtZW50KS5rZXl1cCAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBnYW1lX3J1bm5pbmdcbiAgICBkZXYuY2hhbmdlX3N0YXR1cyhcImNvbXB1dGluZ1wiKVxuICAgIGRldi5vbl90eXBlKClcblxuICAgIHRlcm1pbmFsLmFwcGVuZChjb2RlaXNoLnNsaWNlKGRldi5jdXJfeHAsIGRldi5jdXJfeHAgKyBkZXYuaW5jcmVtZW50KSlcbiAgICB0ZXJtaW5hbC5zY3JvbGxUb3AodGVybWluYWxbMF0uc2Nyb2xsSGVpZ2h0KVxuXG4gICAgaWYgZGV2LmN1cl94cCA+IGRldi54cF90b3RhbFxuICAgICAgZGV2LmNoYW5nZV9zdGF0dXMoXCJ2aWN0b3J5XCIpXG4gICAgICBkZXYubGV2ZWxfdXAoKVxuICAgICAgbG9hZF9maWxlKGxldmVsc1tkZXYubGV2ZWxdKVxuICAgICAgdGVybWluYWwuaHRtbChcIlwiKVxuICAgICAgbGV2ZWxfdXBfbW9kYWwubW9kYWxcbiAgICAgICAgb25IaWRlOiAtPlxuICAgICAgICAgIGdhbWVfcnVubmluZyA9IHRydWVcbiAgICAgIGxldmVsX3VwX21vZGFsLm1vZGFsICdzaG93J1xuICAgICAgZ2FtZV9ydW5uaW5nID0gZmFsc2VcblxuICAkKCcubmV3LWdhbWUtc3RhcnQnKS5vbiAnY2xpY2snLCAtPlxuICAgIGRldi5uYW1lID0gbmFtZV9pbnB1dC52YWwoKVxuICAgIG5ld19nYW1lLm1vZGFsKFwiaGlkZVwiKVxuICAgIGxvYWRfbGV2ZWwoKVxuXG4gICQoJy50ZXJtaW5hbC1idG4nKS5vbiAnY2xpY2snLCAtPlxuICAgIGRldi5idXkoc2tpbGxzLnRlcm1pbmFsKVxuXG4gIGxvYWRfbGV2ZWwgPSAtPlxuICAgIGdhbWVfcnVubmluZyA9IHRydWVcbiAgICBsb2FkX2ZpbGUobGV2ZWxzW2Rldi5sZXZlbF0pXG5cbiAgc3RhcnRfbmV3X2dhbWUoKVxuXG4gIHNldEludGVydmFsIC0+XG4gICAgZGV2LnNhdmUoKVxuICAsIDUwMDBcbiIsIkZ1bmN0aW9uOjpzZXR0ZXIgPSAocHJvcCwgc2V0KSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwge3NldCwgY29uZmlndXJhYmxlOiB5ZXN9XG5cbmNsYXNzIEBEZXZcbiAgYW5pbWF0aW9uID1cbiAgICBkZWZhdWx0OiAgICBcImRlZmF1bHQucG5nXCJcbiAgICB2aWN0b3J5OiAgICBcInZpY3RvcnkuZ2lmXCJcbiAgICBjb21wdXRpbmc6ICBcImNvbXB1dGluZy5naWZcIlxuXG4gIGNvbnN0cnVjdG9yOiAoQHNlbGVjdG9yLCBAbmFtZSkgLT5cbiAgICBAc3RhdHVzICAgICA9IFwiZGVmYXVsdFwiXG4gICAgQG1vbmV5ICAgICAgPSAwXG4gICAgQGh1bmdyeSAgICAgPSAwXG4gICAgQHRpcmVkICAgICAgPSAwXG4gICAgQGFnZSAgICAgICAgPSAwXG4gICAgQGxldmVsICAgICAgPSAwXG4gICAgQGN1cl94cCAgICAgPSAwXG4gICAgQHhwX3RvdGFsICAgPSAwXG4gICAgQGluY3JlbWVudCAgPSAyMFxuICAgIEBza2lsbHMgPVxuICAgICAgdGVybWluYWw6IDFcbiAgICBAc2V0X21vbmV5KEBtb25leSlcbiAgICBAc2V0X2xldmVsKEBsZXZlbClcblxuICBvbl90eXBlOiAtPlxuICAgIEBjdXJfeHAgKz0gQGluY3JlbWVudFxuICAgICQoJy54cCcpLnByb2dyZXNzICdpbmNyZW1lbnQnLCBAaW5jcmVtZW50XG5cbiAgY2hhbmdlX3N0YXR1czogKHN0YXR1cykgLT5cbiAgICBAc3RhdHVzID0gc3RhdHVzXG4gICAgQGFuaW1hdGUoKVxuXG4gIGFuaW1hdGU6IC0+XG4gICAgbmV3X2FuaW1hdGlvbl91cmwgPSBcImFzc2V0cy9kZXZlbG9wZXIvI3thbmltYXRpb25bQHN0YXR1c119XCJcbiAgICBvbGRfYW5pbWF0aW9uX3VybCA9IEBzZWxlY3Rvci5hdHRyKFwic3JjXCIpXG5cbiAgICBpZiBuZXdfYW5pbWF0aW9uX3VybCAhPSBvbGRfYW5pbWF0aW9uX3VybFxuICAgICAgQHNlbGVjdG9yLmF0dHIoXCJzcmNcIiwgXCJhc3NldHMvZGV2ZWxvcGVyLyN7YW5pbWF0aW9uW0BzdGF0dXNdfVwiKVxuXG4gIHNldF94cF90b3RhbDogKHRvdGFsKSAtPlxuICAgIEB4cF90b3RhbCA9IHRvdGFsXG4gICAgJCgnLnhwJykucHJvZ3Jlc3NcbiAgICAgIHRvdGFsOiBAeHBfdG90YWxcbiAgICAgIHRleHQ6XG4gICAgICAgIGFjdGl2ZTogXCJMZXZlbCAje0BsZXZlbH0gOiAoe3ZhbHVlfS97dG90YWx9KVwiXG4gICAgICAgIHN1Y2Nlc3M6IFwiTEVWRUwgVVAhXCJcblxuICBsZXZlbF91cDogLT5cbiAgICBAc2V0X2xldmVsKEBsZXZlbCArIDEpXG4gICAgQGN1cl94cCA9IDBcbiAgICAkKFwiLnNjb3JlXCIpLmh0bWwoQGxldmVsKVxuXG4gIHNldF9tb25leTogKG1vbmV5KSAtPlxuICAgIEBtb25leSA9IG1vbmV5XG4gICAgJChcIi5tb25leVwiKS5odG1sKEBtb25leSlcblxuICBzZXRfbGV2ZWw6IChsZXZlbCkgLT5cbiAgICBAbGV2ZWwgPSBsZXZlbFxuICAgICQoXCIubGV2ZWxcIikuaHRtbChAbGV2ZWwpXG5cbiAgYnV5OiAoc2tpbGwpIC0+XG4gICAgY29uc29sZS5sb2cgXCJNb25leTogI3tAbW9uZXl9LCBza2lsbCBwcmljZTogI3tza2lsbC5wcmljZX1cIlxuICAgIGlmIEBtb25leSA+IHNraWxsLnByaWNlXG4gICAgICBAc2V0X21vbmV5KEBtb25leSAtIHNraWxsLnByaWNlKVxuICAgICAgc2tpbGwuaW5jcmVhc2VfbnVtYmVyKClcblxuICBsb2FkOiAtPlxuICAgIHJldHVybiBpZiBsb2NhbFN0b3JhZ2UubmFtZSA9PSB1bmRlZmluZWRcbiAgICBAbmFtZSA9IGxvY2FsU3RvcmFnZS5uYW1lXG4gICAgQHNldF9tb25leShsb2NhbFN0b3JhZ2UubW9uZXkpXG4gICAgQGh1bmdyeSA9IGxvY2FsU3RvcmFnZS5odW5ncnlcbiAgICBAdGlyZWQgPSBsb2NhbFN0b3JhZ2UudGlyZWRcbiAgICBAc2V0X2xldmVsKGxvY2FsU3RvcmFnZS5sZXZlbClcbiAgICBAc3RhdHVzID0gbG9jYWxTdG9yYWdlLnN0YXR1c1xuICAgIGlmIGxvY2FsU3RvcmFnZS5za2lsbHNcbiAgICAgIEBza2lsbHMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5za2lsbHMpXG5cbiAgc2F2ZTogLT5cbiAgICBsb2NhbFN0b3JhZ2UubmFtZSA9IEBuYW1lXG4gICAgbG9jYWxTdG9yYWdlLm1vbmV5ID0gQG1vbmV5XG4gICAgbG9jYWxTdG9yYWdlLmh1bmdyeSA9IEBodW5ncnlcbiAgICBsb2NhbFN0b3JhZ2UudGlyZWQgPSBAdGlyZWRcbiAgICBsb2NhbFN0b3JhZ2UubGV2ZWwgPSBAbGV2ZWxcbiAgICBsb2NhbFN0b3JhZ2Uuc3RhdHVzID0gQHN0YXR1c1xuICAgIGxvY2FsU3RvcmFnZS5za2lsbHMgPSBKU09OLnN0cmluZ2lmeShAc2tpbGxzKVxuIiwiY2xhc3MgQFNraWxsXG5cbiAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByaWNlLCBAbnVtYmVyKSAtPlxuICAgICQoXCIuI3tAbmFtZX0tcHJpY2VcIikuaHRtbChAcHJpY2UgKyAnJCcpXG4gICAgJChcIi4je0BuYW1lfS1udW1iZXJcIikuaHRtbChAbnVtYmVyKVxuXG4gIGluY3JlYXNlX251bWJlcjogLT5cbiAgICBAbnVtYmVyICs9IDFcbiAgICAkKFwiLiN7QG5hbWV9LW51bWJlclwiKS5odG1sKEBudW1iZXIpXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
