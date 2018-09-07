/**
 * Created by xiequan on 2018/9/7.
 */
;(function($,window,document,undefined){
    var NgEditor = function(ele, opt) {
        var ng_self = this;
        this.$element = ele,
        this.defaults = {
            'debug': true,
            'company_id':'',
            'user_id':'',
            'account_api':'',
            'build_page_api':'',
        },
        this.options = $.extend({}, this.defaults, opt);

        this.user_data = {'user_id':this.options.user_id,'company_id':this.options.company_id};

        this.get_account = function(opt){
            if (ng_self.options.account_api && ng_self.options.company_id && ng_self.options.user_id) {
                ng_self.user_post_data = $.extend({},ng_self.user_data,opt);
                $(document).queue("ajaxRequests",
                    ng_self._load(ng_self.options.account_api,'post',ng_self.user_post_data,function(flag,respone){
                            if (flag) {
                                $('#pl_login_account').find('.pl_login_avatar').attr('src',respone.avatar);
                                $('#pl_login_account').find('.pl_login_name').text(respone.name+' ('+respone.account+')');
                                var group_type = respone.group_type==0 ? '主账户' :"子账户";
                                $('#pl_login_account').find('.pl_login_group').text(group_type);
                            }
                        })
                );
            }
        }
        this.get_ng_page = function() {
            if (ng_self.options.build_page_api && ng_self.options.company_id && ng_self.options.user_id) {
                $(document).queue("ajaxRequests",
                    ng_self._load(ng_self.options.build_page_api,'post',ng_self.user_post_data,function(flag,respone){
                        if (flag) {
                            $('#ng_page').html('');
                            for(var page_id in respone) {
                                var html_str = [];
                                html_str.push('<div class="ng_page_item" rel="'+page_id+'">');
                                html_str.push('<div class="ng_page_snapshot"><img src="'+respone[page_id].snapshot+'"/></div>');
                                html_str.push('<input type="hidden" name="ng_pages[]" value="'+page_id+'">');
                                html_str.push('<div class="ng_page_item_title">'+respone[page_id].title+'</div>');
                                html_str.push('</div>');
                                $('#ng_page').append(html_str.join(''));
                            }

                        }
                    })
                );
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

                    var load_func = eval('ng_self.get_'+rel);
                    if (typeof load_func == "function") {
                        load_func();
                    }
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
                        if (ng_self.options.debug) {
                            console.log('成功');
                        }
                        cb(respone.status,respone_data);

                    } else {
                        if (ng_self.options.debug) {
                            console.log('失败');
                        }
                    }

                },
                error:function(respone){
                    if (ng_self.options.debug) {
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
            this.get_account({});
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