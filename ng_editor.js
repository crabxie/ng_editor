/**
 * Created by xiequan on 2018/9/7.
 */
;(function($,window,document,html2canvas,Wind,undefined){
    var NgEditor = function(opt) {
        var ng_self = this;

        this.version = "1.0.0";
        this.author = "xieq";

        this.defaults = {
            'debug': true,
            'company_id':'',
            'work_id':'',
            'work_name':'',
            'user_id':'',
            'account_api':'',
            'build_page_api':'',
            'build_page_info_api':'',
            'plugins_api':'',
        },
        this.options = $.extend({}, this.defaults, opt);

        //获得一个加载中的模版
        this.get_data_loading_template = function(msg) {
            return "<div class='item_loading_box'><img src='./images/pl_tiny_loading.gif'/><div class='item_loading_mess'>"+msg+"</div></div>";
        }


        //基础用户数据
        this.user_data = {'user_id':this.options.user_id,'company_id':this.options.company_id,'work_id':this.options.work_id};

        this.open_dialog = function(flag,msg) {
            Wind.use('artDialog', 'iframeTools', function(){
                icon = flag ? "success" : "error";
                art.dialog({
                    id: new Date().getTime(),
                    icon: icon,
                    fixed: true,
                    lock: true,
                    background: "#CCCCCC",
                    opacity: 0,
                    content: msg,
                    ok: function () {
                        return true;
                    }
                });
            });
        }
        //活动业务详情
        this.get_work_info = function(opt) {
            $('#pl_work_info .pl_work_info_name').text('业 务: '+ng_self.options.work_name+ " (id:"+ng_self.options.work_id+")");

        }
        //获取账户信息
        this.get_account = function(opt) {
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
        //保存页面设置
        this.save_page = function(opt) {
            $('.page_save').click(function(){
                var btn_self = this;
                $(btn_self).text('保存中...');

                html2canvas(document.querySelector("#pl_miniapp_container")).then(function(canvas){
                    var rel = $('#pl_miniapp_header').attr('rel');
                    var dataUrl = canvas.toDataURL();
                    $('#'+rel).find('.ng_page_snapshot a img').attr('src',dataUrl);
                    $(btn_self).text('保存');
                    ng_self.open_dialog(true,'保存成功！');
                });

            });
        }
        //加载页面信息
        this.get_ng_page = function() {
            if (ng_self.options.build_page_api && ng_self.options.company_id && ng_self.options.user_id) {
                var is_loaded = $('#ng_page').attr('is_loaded');
                if (typeof is_loaded == 'undefined') {
                    $('#ng_page').html('');
                    var loading_template = ng_self.get_data_loading_template('加载中...');
                    $('#ng_page').append(loading_template);
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

                            $('#ng_page').attr('is_loaded','loaded');

                        })
                    );
                }

            }
        }
        //加载组件信息
        this.get_ng_componer = function() {
            if (ng_self.options.build_page_api && ng_self.options.company_id && ng_self.options.user_id) {
                var is_loaded = $('#ng_componer').attr('is_loaded');
                if (typeof is_loaded == 'undefined') {
                    $('#ng_componer').html('');
                    var loading_template = ng_self.get_data_loading_template('加载中...');
                    $('#ng_componer').append(loading_template);
                    $(document).queue("ajaxRequests",
                        ng_self._load(ng_self.options.plugins_api,'post',ng_self.user_post_data,function(flag,respone) {
                            $('#ng_componer').html('');
                            if (ng_self.options.debug) {
                                console.log('plugins: loaded');
                                console.log(respone);
                            }
                            if (flag) {
                                for(var index in respone) {
                                    var plugin_id = respone[index]['path']+'/'+respone[index]['id'];
                                    var html_str = [];
                                    html_str.push('<div class="ng_plugin_item" id="'+plugin_id+'" >');
                                    html_str.push('<div class="ng_plugin_item_icon"><a rel="'+plugin_id+'" href="javascript:void(0);"><img src="'+plugin_id+'/'+respone[index]['icon']+'"/></a></div>');
                                    html_str.push('<div class="ng_plugin_item_title">'+respone[index].name+'</div>');
                                    html_str.push('</div>');
                                    $('#ng_componer').append(html_str.join(''));
                                }
                            }
                            $('#ng_componer').attr('is_loaded','loaded');
                        })
                    );
                }
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

            this.get_account({});

            this.get_work_info({});

            this.handle_tag(0);

            this.save_page({});

            setTimeout(function(){
                $('#pl_mark').css('display','none');
            },1000);

            return this;
        }

    }

    window.NG_EDITOR = NgEditor;
    //$.fn.ng_editor = function(options) {
    //    var ng_editor = new NgEditor(this, options);
    //    return ng_editor.init();
    //}
})(jQuery,window,document,html2canvas,Wind);