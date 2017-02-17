;(function(factory){
if(typeof define == 'function' && define.amd){
    //seajs or requirejs environment
    define(['jquery', 'class', 'overlay', 'mask'], factory);
}else if(typeof module === 'object' && typeof module.exports == 'object'){
    module.exports = factory(
        require('jquery'),
        require('class'),
        require('overlay'),
        require('mask')
    );
}else{
    factory(window.jQuery, window.jQuery.klass, window.jQuery.overlay, window.jQuery.fn.mask);
}
})(function($, Class, Overlay, Mask){
return Class.$factory('dialog', {
    initialize: function(opt){
        var self = this;
        var options = self.options = $.extend({
            title: '',
            closeButtonDisabled: false,
            container: document.body,
            dom: null,
            width: 400,
            height: false,
            content: '',
            url: '',
            esc: false,    //ESC是否开启，ESC按下自动关闭
            mask: true,                    //蒙版
            autoOpen: false,
            buttons: {},
            handler: null,                //指定打开和关闭dialog的元素
            className: ''
        }, opt || {});

        self.dom = null;

        if(options.mask){
            self.$mask = new Mask({autoOpen: false, container: options.container});
        }

        self.create();
        self.isFirstOpen = true;
        self.initEvent();
        self.options.autoOpen && self.open();
    },

    initEvent: function(){
        var self = this, options = self.options;

        if(options.handler){
            self.o2s(options.handler, 'click', function(){
                self.open();
            });
        }

        self.$.find('.ui3-dialog-close').click(function(){
            self.close();
        });

        if(self.options.esc){
            self.o2s(document.body, 'keyup', function(e){
                //esc关闭
                e.keyCode == 27 && self.close();
            });

            self.o2s(options.container, 'click', function(e){
                self.close();
            });

            self.$.on('click', function(e){
                e.stopPropagation();
            });
        }
    },

    create: function(){
        var self = this, options = self.options;

        self.$overlay = new Overlay({
            container: options.container,
            width: options.width,
            content: '<a href="javascript:" class="ui3-dialog-close">&times;</a><div class="ui3-dialog-content"></div>',
            autoOpen: false,
            className: 'ui3-dialog ' + options.className,
            center: true
        });

        self.$ = self.$overlay.$;
        self.$content = self.$.find('.ui3-dialog-content').css('height', options.height);
        options.closeButtonDisabled && self.disableCloseButton();
        self.setTitle(options.title);
        self.setButtons(options.buttons);
        self.initContent();
    },

    initContent: function(){
        var self = this, options = self.options;

        if(options.content){
            self.setContent(options.content);
        }else if(options.dom){
            self.setDom(options.dom);
        }else if(options.url){
            self.load(options.url);
        }
    },

    setContent: function(content){
        var self = this;

        self.releaseDom();
        self.$content.html(content);
        self.$overlay.setPosCenter();
    },

    setDom: function(dom){
        var self = this;

        self.releaseDom();
        self.$content.empty().append(self.$dom = $(dom));
        self.$overlay.setPosCenter();
    },

    load: function(url){
        var self = this;

        $.get(url, function(text){
            self.setContent(content);
            self.trigger('contentLoaded');
        });
    },

    setButtons: function(buttons){
        var self = this, $overlay = self.$overlay.$;

        if(!buttons || $.isEmptyObject(buttons)){
            $overlay.find('.ui3-dialog-buttons').remove();
            return;
        }

        var $group = $('<ul class="ui3-dialog-buttons">');
        var count = 0;

        $.each(buttons, function(index, item){
            count++;

            if($.isFunction(item)){
                item = {
                    events: {
                        click: item
                    },

                    className: ''
                };    
            }

            var $button = $('<a href="javascript:void(0);" class="ui3-dialog-button" data-dialog-button-name="' + index + '" />').text(index).addClass(item.className);

            $.each(item.events, function(event, callback){
                $button.on(event, function(){
                    !$button.hasClass('ui3-dialog-button-disabled') && callback.call(self, $button);
                });
            });

            $('<li>').append($button).appendTo($group);
        });

        $group.find('li').css('width', (100/count) + '%');
        $overlay.append($group);
    },

    getButton: function(name){
        var $buttons = this.$.find('.ui3-dialog-button');
        return typeof name == 'number' ? $buttons.eq(name) : $buttons.filter('[data-dialog-button-name="' + name + '"]');
    },

    enableButton: function(name){
        this.getButton(name).removeClass('ui3-dialog-button-disabled');
    },

    disableButton: function(name){
        this.getButton(name).addClass('ui3-dialog-button-disabled');
    },

    enableCloseButton: function(){
        this.$.find('.ui3-dialog-close').show();
    },

    disableCloseButton: function(){
        this.$.find('.ui3-dialog-close').hide();
    },

    //设置title，为false时，则头部会被隐藏掉
    setTitle: function(title){
        var self = this, $Overlay

        if(!title){
            self.$.find('.ui3-dialog-title').remove();
        }else{
            self.$.find('.ui3-dialog-content').before('<div class="ui3-dialog-title">' + title + '</div>');
        }

        self.$overlay.setPosCenter();
    },

    open: function(){
        var self = this, options = self.options;

        self.$mask && self.$mask.open();
        self.$overlay.open();
        self.trigger('open');

        if(self.isFirstOpen){
            self.trigger('firstOpen');
            self.isFirstOpen = false;
        }
    },

    close: function(){
        var self = this;

        self.$mask && self.$mask.close();
        self.$overlay.hide();
        self.trigger('close');
    },

    releaseDom: function(){
        var self = this;

        self.$dom && self.$dom.appendTo(self.options.container);
        self.$dom = null;
    },

    destroy: function(){
        var self = this, options = self.options;

        self.$mask && self.$mask.destroy();
        self.$mask = null;
        self.releaseDom();
        self.$overlay.destroy();
        self.$overlay = null;
        self.ofs(window, 'resize');
        options.esc && self.ofs(options.container, 'click');
        options.handler && self.ofs(options.handler, 'click');
        self.ofs(document.body, 'keyup');
    }
});
});