/**
 * Created by xiequan on 2018/9/7.
 */
;(function($,window,document,undefined){
    var NgEditor = function(ele, opt) {
        this.$element = ele,
        this.defaults = {
            'debug': true
        },
        this.options = $.extend({}, this.defaults, opt);

        this.handle_tag = function(index) {
            $('a.ng_tag').each(function(){
                var a_obj = this;
                $(a_obj).removeClass('ng_btn_active');
                $(a_obj).click(function(){
                    $('a.ng_tag').each(function(){
                        $(this).removeClass('ng_btn_active');
                    });
                    $('.ng_tag_ctl').each(function(k,v){
                        $(v).css({'display':'none'});
                    });
                    $(a_obj).addClass('ng_btn_active');
                    var rel = $(a_obj).attr('rel');
                    console.log('#'+rel);
                    $('#'+rel).css({'display':'block'});
                });
            });
            $('a.ng_tag').get(index).click();
        }
}
    NgEditor.prototype = {
        init : function() {
            if (this.options.debug) {
                console.log('NgEditor init');
                console.log('mode: debug');
            }
            this.handle_tag(0);
        }

    }
    $.fn.ng_editor = function(options) {
        //创建Beautifier的实体
        var ng_editor = new NgEditor(this, options);
        //调用其方法
        return ng_editor.init();
    }
})(jQuery,window,document);