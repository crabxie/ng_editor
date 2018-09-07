/**
 * Created by xiequan on 2018/9/7.
 */
;(function($,window,document,undefined){
    var NgEditor = function(ele, opt) {
        var self = this;
        this.$element = ele,
        this.defaults = {
            'debug': true,
            'company_id':'',
            'user_id':'',
            'account_api':'',
            'page_api':'',
        },
        this.options = $.extend({}, this.defaults, opt);

        this.user_data = {'user_id':this.options.user_id,'company_id':this.options.company_id};

        this.getAccount = function(opt){
            if (this.options.account_api && this.options.company_id && this.options.user_id) {
                this.user_post_data = $.extend({},this.user_data,opt);
                this._load(this.options.account_api,'post',this.user_post_data,function(flag,respone){
                    if (flag) {
                        $('#pl_login_account').find('.pl_login_avatar').attr('src',respone.avatar);
                        $('#pl_login_account').find('.pl_login_name').text(respone.name+' ('+respone.account+')');
                        var group_type = respone.group_type==0 ? '主账户' :"子账户";
                        $('#pl_login_account').find('.pl_login_group').text(group_type);
                    }
                });
            }
        }
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
                    $('#'+rel).css({'display':'block'});
                });
            });
            $('a.ng_tag').get(index).click();
        };
        this._load = function(url,method,data,cb) {

            var myform = new FormData();
            method = method=='get' ? 'GET' : 'POST';
            if (data) {
                for(k in data) {
                    myform.append(k,data[k]);
                }
            }
            $.ajax({
                url: url,
                type: method,
                data: myform,
                contentType: false,
                processData: false,
                success: function (respone) {
                    respone = eval('['+respone+']')[0];
                    var respone_data =respone.data;
                    if (respone.status) {
                        if (self.options.debug) {
                            console.log('成功');
                        }
                        cb(respone.status,respone_data);

                    } else {
                        if (self.options.debug) {
                            console.log('失败');
                        }
                    }

                },
                error:function(respone){
                    if (self.options.debug) {
                        console.log('发生错误');
                    }

                    //artdialog_alert('发生错误');
                }
            });
        }
    }
    NgEditor.prototype = {
        init : function() {
            if (this.options.debug) {
                console.log('NgEditor init');
                console.log('mode: debug');
            }
            this.getAccount({});
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