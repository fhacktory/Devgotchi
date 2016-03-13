(function() {
  $(function() {
    var codeish, dev, game_running, level_up_modal, levels, load_file, load_level, name_input, new_game, start_button, start_new_game, terminal;
    game_running = false;
    dev = new Dev($(".developer"));
    codeish = '';
    terminal = $('.console');
    new_game = $('.new-game').modal();
    level_up_modal = $('.level-up').modal();
    start_button = $('.new-game-start');
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
      dev.one_type();
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
    }

    Dev.prototype.one_type = function() {
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
      this.level += 1;
      this.cur_xp = 0;
      return $(".score").html(this.level);
    };

    Dev.prototype.load = function() {
      if (localStorage.name === void 0) {
        return;
      }
      this.name = localStorage.name;
      this.money = localStorage.money;
      this.hungry = localStorage.hungry;
      this.tired = localStorage.tired;
      this.level = +localStorage.level;
      return this.status = localStorage.status;
    };

    Dev.prototype.save = function() {
      localStorage.name = this.name;
      localStorage.money = this.money;
      localStorage.hungry = this.hungry;
      localStorage.tired = this.tired;
      localStorage.level = this.level;
      return localStorage.status = this.status;
    };

    return Dev;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb2ZmZWUiLCJkZXZlbG9wZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsQ0FBQSxDQUFFLFNBQUE7QUFDQSxRQUFBO0lBQUEsWUFBQSxHQUFnQjtJQUNoQixHQUFBLEdBQW9CLElBQUEsR0FBQSxDQUFJLENBQUEsQ0FBRSxZQUFGLENBQUo7SUFDcEIsT0FBQSxHQUFnQjtJQUNoQixRQUFBLEdBQWdCLENBQUEsQ0FBRSxVQUFGO0lBQ2hCLFFBQUEsR0FBZ0IsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsQ0FBQTtJQUNoQixjQUFBLEdBQWdCLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxLQUFmLENBQUE7SUFDaEIsWUFBQSxHQUFnQixDQUFBLENBQUUsaUJBQUY7SUFDaEIsVUFBQSxHQUFnQixDQUFBLENBQUUsaUJBQUY7SUFDaEIsTUFBQSxHQUNFO01BQUEsQ0FBQSxFQUFHLFFBQUg7TUFDQSxDQUFBLEVBQUcsVUFESDtNQUVBLENBQUEsRUFBRyxTQUZIO01BR0EsQ0FBQSxFQUFHLFNBSEg7TUFJQSxDQUFBLEVBQUcsVUFKSDtNQUtBLENBQUEsRUFBRyxTQUxIOztJQU9GLFNBQUEsR0FBWSxTQUFDLFFBQUQ7YUFDVixDQUFDLENBQUMsSUFBRixDQUNFO1FBQUEsR0FBQSxFQUFLLGVBQUEsR0FBZ0IsUUFBckI7UUFDQSxPQUFBLEVBQVMsU0FBQyxJQUFEO1VBQ1AsT0FBQSxHQUFVO2lCQUNWLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQU8sQ0FBQyxNQUF6QjtRQUZPLENBRFQ7T0FERjtJQURVO0lBT1osY0FBQSxHQUFpQixTQUFBO01BQ2YsR0FBRyxDQUFDLElBQUosQ0FBQTtNQUNBLElBQUEsQ0FBTyxHQUFHLENBQUMsSUFBWDtRQUNFLFFBQVEsQ0FBQyxLQUFULENBQWUsTUFBZjtRQUNBLFlBQVksQ0FBQyxFQUFiLENBQWdCLE9BQWhCLEVBQXlCLFNBQUE7VUFDdkIsR0FBRyxDQUFDLElBQUosR0FBVyxV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QWIsR0FBcUIsSUFBQyxDQUFBO01BQ3RCLFlBQVksQ0FBQyxNQUFiLEdBQXNCLElBQUMsQ0FBQTtNQUN2QixZQUFZLENBQUMsS0FBYixHQUFxQixJQUFDLENBQUE7TUFDdEIsWUFBWSxDQUFDLEtBQWIsR0FBcUIsSUFBQyxDQUFBO2FBQ3RCLFlBQVksQ0FBQyxNQUFiLEdBQXNCLElBQUMsQ0FBQTtJQU5uQjs7Ozs7QUExRFIiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJCAtPlxuICBnYW1lX3J1bm5pbmcgID0gZmFsc2VcbiAgZGV2ICAgICAgICAgICA9IG5ldyBEZXYoJChcIi5kZXZlbG9wZXJcIikpXG4gIGNvZGVpc2ggICAgICAgPSAnJ1xuICB0ZXJtaW5hbCAgICAgID0gJCgnLmNvbnNvbGUnKVxuICBuZXdfZ2FtZSAgICAgID0gJCgnLm5ldy1nYW1lJykubW9kYWwoKVxuICBsZXZlbF91cF9tb2RhbD0gJCgnLmxldmVsLXVwJykubW9kYWwoKVxuICBzdGFydF9idXR0b24gID0gJCgnLm5ldy1nYW1lLXN0YXJ0JylcbiAgbmFtZV9pbnB1dCAgICA9ICQoJy5jaGFyYWN0ZXItbmFtZScpXG4gIGxldmVscyAgICAgICAgID1cbiAgICAwOiAnY29kZS5jJ1xuICAgIDE6ICdjb2RlLmNwcCdcbiAgICAyOiAnY29kZS5weSdcbiAgICAzOiAnY29kZS5yYidcbiAgICA0OiAnY29kZS5sdWEnXG4gICAgNTogJ2NvZGUuZ28nXG5cbiAgbG9hZF9maWxlID0gKGZpbGVuYW1lKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBcImNvZGVfc2FtcGxlcy8je2ZpbGVuYW1lfVwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgY29kZWlzaCA9IGRhdGFcbiAgICAgICAgZGV2LnNldF94cF90b3RhbChjb2RlaXNoLmxlbmd0aClcblxuICBzdGFydF9uZXdfZ2FtZSA9IC0+XG4gICAgZGV2LmxvYWQoKVxuICAgIHVubGVzcyBkZXYubmFtZVxuICAgICAgbmV3X2dhbWUubW9kYWwoXCJzaG93XCIpXG4gICAgICBzdGFydF9idXR0b24ub24gJ2NsaWNrJywgLT5cbiAgICAgICAgZGV2Lm5hbWUgPSBuYW1lX2lucHV0LnZhbCgpXG4gICAgICAgIG5ld19nYW1lLm1vZGFsKFwiaGlkZVwiKVxuICAgICAgICBsb2FkX2xldmVsKClcbiAgICBsb2FkX2xldmVsKClcblxuICAkKGRvY3VtZW50KS5rZXl1cCAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBnYW1lX3J1bm5pbmdcbiAgICBkZXYuY2hhbmdlX3N0YXR1cyhcImNvbXB1dGluZ1wiKVxuICAgIGRldi5vbmVfdHlwZSgpXG5cbiAgICB0ZXJtaW5hbC5hcHBlbmQoY29kZWlzaC5zbGljZShkZXYuY3VyX3hwLCBkZXYuY3VyX3hwICsgZGV2LmluY3JlbWVudCkpXG4gICAgdGVybWluYWwuc2Nyb2xsVG9wKHRlcm1pbmFsWzBdLnNjcm9sbEhlaWdodClcblxuICAgIGlmIGRldi5jdXJfeHAgPiBkZXYueHBfdG90YWxcbiAgICAgIGRldi5jaGFuZ2Vfc3RhdHVzKFwidmljdG9yeVwiKVxuICAgICAgZGV2LmxldmVsX3VwKClcbiAgICAgIGxvYWRfZmlsZShsZXZlbHNbZGV2LmxldmVsXSlcbiAgICAgIHRlcm1pbmFsLmh0bWwoXCJcIilcbiAgICAgIGxldmVsX3VwX21vZGFsLm1vZGFsXG4gICAgICAgIG9uSGlkZTogLT5cbiAgICAgICAgICBnYW1lX3J1bm5pbmcgPSB0cnVlXG4gICAgICBsZXZlbF91cF9tb2RhbC5tb2RhbCAnc2hvdydcbiAgICAgIGdhbWVfcnVubmluZyA9IGZhbHNlXG5cbiAgbG9hZF9sZXZlbCA9IC0+XG4gICAgZ2FtZV9ydW5uaW5nID0gdHJ1ZVxuICAgIGxvYWRfZmlsZShsZXZlbHNbZGV2LmxldmVsXSlcblxuICBzdGFydF9uZXdfZ2FtZSgpXG5cbiAgc2V0SW50ZXJ2YWwgLT5cbiAgICBkZXYuc2F2ZSgpXG4gICwgNTAwMFxuIiwiRnVuY3Rpb246OnNldHRlciA9IChwcm9wLCBzZXQpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCB7c2V0LCBjb25maWd1cmFibGU6IHllc31cblxuY2xhc3MgQERldlxuICBhbmltYXRpb24gPVxuICAgIGRlZmF1bHQ6ICAgIFwiZGVmYXVsdC5wbmdcIlxuICAgIHZpY3Rvcnk6ICAgIFwidmljdG9yeS5naWZcIlxuICAgIGNvbXB1dGluZzogIFwiY29tcHV0aW5nLmdpZlwiXG5cbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IsIEBuYW1lKSAtPlxuICAgIEBzdGF0dXMgICAgID0gXCJkZWZhdWx0XCJcbiAgICBAbW9uZXkgICAgICA9IDBcbiAgICBAaHVuZ3J5ICAgICA9IDBcbiAgICBAdGlyZWQgICAgICA9IDBcbiAgICBAYWdlICAgICAgICA9IDBcbiAgICBAbGV2ZWwgICAgICA9IDBcbiAgICBAY3VyX3hwICAgICA9IDBcbiAgICBAeHBfdG90YWwgICA9IDBcbiAgICBAaW5jcmVtZW50ICA9IDIwXG5cbiAgb25lX3R5cGU6IC0+XG4gICAgQGN1cl94cCArPSBAaW5jcmVtZW50XG4gICAgJCgnLnhwJykucHJvZ3Jlc3MgJ2luY3JlbWVudCcsIEBpbmNyZW1lbnRcblxuICBjaGFuZ2Vfc3RhdHVzOiAoc3RhdHVzKSAtPlxuICAgIEBzdGF0dXMgPSBzdGF0dXNcbiAgICBAYW5pbWF0ZSgpXG5cbiAgYW5pbWF0ZTogLT5cbiAgICBuZXdfYW5pbWF0aW9uX3VybCA9IFwiYXNzZXRzL2RldmVsb3Blci8je2FuaW1hdGlvbltAc3RhdHVzXX1cIlxuICAgIG9sZF9hbmltYXRpb25fdXJsID0gQHNlbGVjdG9yLmF0dHIoXCJzcmNcIilcblxuICAgIGlmIG5ld19hbmltYXRpb25fdXJsICE9IG9sZF9hbmltYXRpb25fdXJsXG4gICAgICBAc2VsZWN0b3IuYXR0cihcInNyY1wiLCBcImFzc2V0cy9kZXZlbG9wZXIvI3thbmltYXRpb25bQHN0YXR1c119XCIpXG5cbiAgc2V0X3hwX3RvdGFsOiAodG90YWwpIC0+XG4gICAgQHhwX3RvdGFsID0gdG90YWxcbiAgICAkKCcueHAnKS5wcm9ncmVzc1xuICAgICAgdG90YWw6IEB4cF90b3RhbFxuICAgICAgdGV4dDpcbiAgICAgICAgYWN0aXZlOiBcIkxldmVsICN7QGxldmVsfSA6ICh7dmFsdWV9L3t0b3RhbH0pXCJcbiAgICAgICAgc3VjY2VzczogXCJMRVZFTCBVUCFcIlxuXG4gIGxldmVsX3VwOiAtPlxuICAgIEBsZXZlbCArPSAxXG4gICAgQGN1cl94cCA9IDBcbiAgICAkKFwiLnNjb3JlXCIpLmh0bWwoQGxldmVsKVxuXG5cbiAgbG9hZDogLT5cbiAgICByZXR1cm4gaWYgbG9jYWxTdG9yYWdlLm5hbWUgPT0gdW5kZWZpbmVkXG4gICAgQG5hbWUgPSBsb2NhbFN0b3JhZ2UubmFtZVxuICAgIEBtb25leSA9IGxvY2FsU3RvcmFnZS5tb25leVxuICAgIEBodW5ncnkgPSBsb2NhbFN0b3JhZ2UuaHVuZ3J5XG4gICAgQHRpcmVkID0gbG9jYWxTdG9yYWdlLnRpcmVkXG4gICAgQGxldmVsID0gK2xvY2FsU3RvcmFnZS5sZXZlbFxuICAgIEBzdGF0dXMgPSBsb2NhbFN0b3JhZ2Uuc3RhdHVzXG5cbiAgc2F2ZTogLT5cbiAgICBsb2NhbFN0b3JhZ2UubmFtZSA9IEBuYW1lXG4gICAgbG9jYWxTdG9yYWdlLm1vbmV5ID0gQG1vbmV5XG4gICAgbG9jYWxTdG9yYWdlLmh1bmdyeSA9IEBodW5ncnlcbiAgICBsb2NhbFN0b3JhZ2UudGlyZWQgPSBAdGlyZWRcbiAgICBsb2NhbFN0b3JhZ2UubGV2ZWwgPSBAbGV2ZWxcbiAgICBsb2NhbFN0b3JhZ2Uuc3RhdHVzID0gQHN0YXR1c1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
