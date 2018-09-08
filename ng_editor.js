/**
 * Created by xiequan on 2018/9/7.
 */
;(function($,window,document,html2canvas){
    var NgEditor = function(ele, opt) {
        var ng_self = this;
        this.$element = ele,
        this.defaults = {
            'debug': true,
            'company_id':'',
            'work_id':'',
            'work_name':'',
            'user_id':'',
            'account_api':'',
            'build_page_api':'',
            'build_page_info_api':'',
        },
        this.options = $.extend({}, this.defaults, opt);

        this.user_data = {'user_id':this.options.user_id,'company_id':this.options.company_id,'work_id':this.options.work_id};

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
        this.save_page = function(opt) {
            $('.page_save').click(function(){
                var btn_self = this;
                $(btn_self).text('保存中...');


                html2canvas(document.querySelector("#pl_miniapp_container")).then(function(canvas){
                    var rel = $('#pl_miniapp_header').attr('rel');
                    var dataUrl = canvas.toDataURL();
                    $('#'+rel).find('.ng_page_snapshot a img').attr('src',dataUrl);

                    $(btn_self).text('保存');
                });

            });
        }
        this.get_ng_page = function() {
            if (ng_self.options.build_page_api && ng_self.options.company_id && ng_self.options.user_id) {
                $(document).queue("ajaxRequests",
                    ng_self._load(ng_self.options.build_page_api,'post',ng_self.user_post_data,function(flag,respone){
                        $('#ng_page').html('');
                        var default_page_id = '';
                        var default_page_title = '未命名';
                        if (flag) {
                            for(var page_id in respone) {
                                if(!default_page_id) default_page_id = page_id;
                                var html_str = [];
                                html_str.push('<div class="ng_page_item" id="'+page_id+'" >');
                                html_str.push('<div class="ng_page_snapshot"><a rel="'+page_id+'" href="javascript:void(0);"><img src="'+respone[page_id].snapshot+'"/></a></div>');
                                html_str.push('<input type="hidden" name="ng_pages[]" value="'+page_id+'">');
                                html_str.push('<div class="ng_page_item_title">'+respone[page_id].title+'</div>');
                                html_str.push('</div>');
                                $('#ng_page').append(html_str.join(''));
                            }
                            //默认点击第一个。
                        } else {
                            default_page_id = 'page_1';
                            var html_str = [];
                            html_str.push('<div class="ng_page_item" id="'+default_page_id+'" >');
                            html_str.push('<div class="ng_page_snapshot"><a rel="'+default_page_id+'" href="javascript:void(0);"><img src=""/></a></div>');
                            html_str.push('<input type="hidden" name="ng_pages[]" value="'+default_page_id+'">');
                            html_str.push('<div class="ng_page_item_title">'+default_page_title+'</div>');
                            html_str.push('</div>');
                            $('#ng_page').append(html_str.join(''));
                        }
                        //bind page event

                        $("#ng_page .ng_page_snapshot a").click(function(){
                            var btn_self = this;
                            var rel = $(btn_self).attr('rel');
                            console.log('2112');

                            var post_data = $.extend({}, {'page_id':rel}, ng_self.user_post_data);
                            if (ng_self.options.debug) {
                                console.log('page:'+rel+' on click');
                                console.log(post_data);
                            }
                            ng_self._load(ng_self.options.build_page_info_api,'post',post_data,function(flag,respone){
                                var page_show_title = respone.title;
                                var page_config = respone.config;
                                $('#pl_miniapp_header').attr('rel',rel);
                                if(flag) {
                                    $('#pl_miniapp_container .pl_miniapp_title').text(page_show_title);
                                } else {
                                    $('#pl_miniapp_container .pl_miniapp_title').text(default_page_title);
                                }
                                //build the page

                            });
                        });

                        setTimeout(function(){
                            $('#'+default_page_id).find(".ng_page_snapshot a").trigger('click',[]);
                        },300);


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
                    } else {
                        if (ng_self.options.debug) {
                            console.log('失败');
                        }
                    }
                    cb(respone.status,respone_data);

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
            $('#pl_mark').css('display','block');
            $('#pl_work_info .pl_work_info_name').text('业 务: '+this.options.work_name+ " (id:"+this.options.work_id+")");

            this.get_account({});

            this.handle_tag(0);

            this.save_page({});

            setTimeout(function(){
                $('#pl_mark').css('display','none');
            },1000);

        }

    }
    $.fn.ng_editor = function(options) {
        //创建Beautifier的实体
        var ng_editor = new NgEditor(this, options);
        //调用其方法
        return ng_editor.init();
    }
})(jQuery,window,document,html2canvas);