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
            'app_sid' : '',
            'work_name':'',
            'user_id':'',
            'token':'',
            'account_api':'',
            'build_page_api':'',
            'build_page_info_api':'',
            'save_page_api' : '',
            'plugins_api':'',
            'plugins_call_api':'',
        },
        this.options = $.extend({}, this.defaults, opt);



        $.contextMenu({
            selector: '.image_menu',
            callback: function(key, options) {
                var m = "global: " + key;
                switch (key) {
                    case 'delete' : {
                        var root_elem = $(this);
                        $(root_elem).remove();
                    }break;
                    default :break
                }
            },
            items: {

                "attr": {name: "属性", icon: ""},
                "delete": {name: "删除", icon: ""},
                "sep1": "---------",
                "quit": {name: "退出", icon: ""}
            }
        });

        this.hire = function()
        {
            $( "#pl_miniapp_main" ).sortable({
                cursor: "move",
                revert: true,
                items: ".image_menu",
                //placeholder: "sortable-placeholder",
                start: function( event, ui ) {
                    ui.item.css('max-width','374px');
                },
                stop: function( event, ui ) {
                    ui.item.css('max-width','100%');
                }
            });
        }
        //通用方法
        this.trim = function(str)
        {
            return str.replace(/(^\s*)|(\s*$)/g, '');
        }

        this.ltrim = function(str)
        {
            return str.replace(/^\s*/g,'');
        }
        this.rtrim = function(str)
        {
            return str.replace(/\s*$/,'');
        }
        this.uuid = function(len, radix) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = [], i;
            radix = radix || chars.length;

            if (len) {
                // Compact form
                for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
            } else {
                // rfc4122, version 4 form
                var r;

                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                // Fill in random data. At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random()*16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }

            return uuid.join('');
        }

        this.attr_edit_global = function(attr) {
            var attr_view = "";
            attr_view = "<div id='attr_global' class='attr_box'>" ;

            attr_view+= "<label for='attr_backgroundTextStyle'>页面文字样式</label><select id='attr_backgroundTextStyle'>" +
                "<option value='dark'>dark</option>" +
                "<option value='light'>light</option>" +
                "</select>"+
                "<hr/>";
            ;
            attr_view+= "<label for='attr_navigationBarBackgroundColor'>导航栏目背景颜色</label><input id='attr_navigationBarBackgroundColor' value='"+attr.navigationBarBackgroundColor+"'>" +
                "<hr/>";
            attr_view+= "<label for='attr_navigationBarTitleText'>导航栏目文字</label><input id='attr_navigationBarTitleText' value='"+attr.navigationBarTitleText+"'>" +
                "<hr/>";
            attr_view+= "<label for='attr_navigationBarTextStyle'>导航栏目文字样式</label><select id='attr_navigationBarTextStyle'>" +
                "<option value='black'>black</option>" +
                "<option value='white'>white</option>" +
                "</select>"+
                "<hr/>";
            ;
            attr_view+= '<textarea class="pre_data" style="display: none;" id="ng_page_window" name="post_s[window]">'+JSON.stringify(attr)+'</textarea>';
            attr_view+= "<div><button  class='btn btn-info btn-apply'>应用</button></div>";
            attr_view+= "</div>";
            $('#ng_page_global').html(attr_view).css('display','block');

            $('#attr_global').find('.btn-apply').click(function(){
                var json_str = $('#ng_page_window').text();

                var backgroundTextStyle = $('#attr_backgroundTextStyle').val();
                var navigationBarBackgroundColor = $('#attr_navigationBarBackgroundColor').val();
                var navigationBarTitleText = $('#attr_navigationBarTitleText').val();
                var navigationBarTextStyle = $('#attr_navigationBarTextStyle').val();
                console.log('btn-apply click');
                console.log(json_str);

                $('#pl_miniapp_header').css('background-color',navigationBarBackgroundColor);
                $('#pl_miniapp_container .pl_miniapp_title').text(navigationBarTitleText).css('color',navigationBarTextStyle);

                var json_obj = JSON.parse(json_str);
                json_obj.backgroundTextStyle = backgroundTextStyle;
                json_obj.navigationBarBackgroundColor = navigationBarBackgroundColor;
                json_obj.navigationBarTitleText = navigationBarTitleText;
                json_obj.navigationBarTextStyle = navigationBarTextStyle;

                $('#ng_page_window').text(JSON.stringify(json_obj));

                sessionStorage.setItem('ng_window',JSON.stringify(json_obj));

            });

        }

        this.parser_layout = function (selector,layout_item,layout_style,parent) {

            if(typeof layout_item == 'object') {
                var elem_name = layout_item.name;
                if (layout_item.id) {
                    var elem_id = layout_item.id;
                } else {
                    var elem_id = 'ng_'+ng_self.uuid(8,16);
                }
                console.log(layout_style.css);
                var style = '';
                if (layout_item.config.style) {
                    style = layout_item.config.style;
                } else if(layout_item.class){

                    var reStr = '\.' + layout_item.class + '[ \s]*\{([^\}]+?)\}';
                    var pattern = new RegExp(reStr, "gi");
                    var match = pattern.exec(layout_style.css);
                    if (match && match[1]) {
                        style = match[1];
                    }
                }

                var _layout_str = '';
                if ('image' == elem_name) {
                    var _image_box  =  '<img style="'+style+'" onerror=\'this.onerror="";this.src="/wxapp/asset/simpleboot/images/default_image.jpg"\' src="" id="'+elem_id+'" class="  ngedt_'+layout_item.class+'"/>';

                    _layout_str = '<div class="layout_box image_menu" rel="'+elem_id+'" id="'+elem_id+'_box">';
                    _layout_str+= _image_box;

                    var key_post_name = '';
                    if (parent) {
                        var parent_array = parent.split('/');
                        for(var p_i in parent_array) {
                            key_post_name+= '['+parent_array[p_i]+']';
                        }
                    }
                    key_post_name+='['+elem_id+']';
                    _layout_str+= '<textarea class="pre_data" style="display: none;" id="'+elem_id+'_data" name="post_c'+key_post_name+'">'+JSON.stringify(layout_item)+'</textarea>';

                    _layout_str+= '</div>';


                    if (typeof selector == 'object') {
                        selector.append(_layout_str)
                    } else if (typeof selector == 'string') {
                        $(selector).append(_layout_str);
                    }
                    var root_elem = $('#'+elem_id+'_box');

                    if (typeof layout_item.subs == 'array') {
                        if (layout_item.subs.length>0) {
                            var parent_array = [];
                            if (parent) {
                                var parent_array = parent.split('/');
                            }
                            parent_array.push(elem_id);
                            var sub_parent = parent_array.join('/');
                            for(var loop_index in layout_item.subs) {
                                var layout_item = layout_item.subs[loop_index];
                                if (layout_item.type == 'base') {
                                    ng_self.parser_layout(root_elem,layout_item,layout_style,sub_parent);
                                }

                            }
                        }
                    }
                }
            }
        }
        this.page_layout = function(root_elem,layout_data,layout_style) {
            //console.log(layout_data);

            if(typeof layout_data == 'object') {
                var _layout_str = '<textarea class="pre_data" style="display: none;" id="ng_page_style" name="post_s[style]">'+JSON.stringify(layout_style)+'</textarea>';
                $(root_elem).append(_layout_str);

                for(var loop_index in layout_data.layout) {
                    var layout_item = layout_data.layout[loop_index];
                    if (layout_item.type == 'base') {
                        ng_self.parser_layout($(root_elem),layout_item,layout_style,'');
                    }
                }
            }
        }
        this.plugin_append = function(obj,data)
        {
            console.log('----plugin_append----');
            console.log(obj);
            console.log(data);
            var elem_id = ng_self.uuid(8,16);
            var append_str = '<div class="layout_box image_menu" style="width: 100%;height: 40px;background: #acd;" rel="'+elem_id+'" id="'+elem_id+'_box">12321</div>';
            $('#pl_miniapp_main').append(append_str);
        }

        this.clean_cache = function(selector) {
            $(selector).click(function(){
                sessionStorage.clear();
                ng_self.appeditor_open_dialog(true,'清除缓存成功');
            });
        }
        //通用方法结束

        //获得一个加载中的模版
        this.get_data_loading_template = function(msg) {
            return "<div class='item_loading_box'><img src='/ngeditor/images/pl_tiny_loading.gif'/><div class='item_loading_mess'>"+msg+"</div></div>";
        }


        //基础用户数据
        this.user_data = {'user_id':this.options.user_id,'company_id':this.options.company_id,'work_id':this.options.work_id,'app_sid':this.options.app_sid};

        this.appeditor_open_dialog = function(flag,msg) {
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
        this.appeditor_open_frame_dialog = function(url,dialog_title,callback){
            Wind.use("artDialog","iframeTools",function(){
                art.dialog.open( url, {
                    title: dialog_title,
                    id: new Date().getTime(),
                    width: '650px',
                    height: '420px',
                    lock: true,
                    fixed: true,
                    background:"#CCCCCC",
                    opacity:0,
                    ok: function() {
                        if (typeof callback =='function') {
                            var iframewindow = this.iframe.contentWindow;
                            var files=iframewindow.get_selected_items();
                            if(files){
                                callback.apply(this, [this, files,extra_params]);
                            }else{
                                return false;
                            }

                        }
                    },
                    cancel: true
                });
            });
        }
        //活动业务详情
        this.get_work_info = function(opt) {
            //$('#pl_work_info .pl_work_info_name').text('业 务: '+ng_self.options.work_name+ " (id:"+ng_self.options.work_id+")");

        }
        //获取账户信息
        this.get_account = function(opt) {
            if (ng_self.options.account_api && ng_self.options.company_id && ng_self.options.user_id) {
                ng_self.user_post_data = $.extend({},ng_self.user_data,opt);
                //$(document).queue("ajaxRequests",
                //    ng_self._load(ng_self.options.account_api,'post',ng_self.user_post_data,function(flag,respone){
                //            if (flag) {
                //                $('#pl_login_account').find('.pl_login_avatar').attr('src',respone.avatar);
                //                $('#pl_login_account').find('.pl_login_name').text(respone.name+' ('+respone.account+')');
                //                var group_type = respone.group_type==0 ? '主账户' :"子账户";
                //                $('#pl_login_account').find('.pl_login_group').text(group_type);
                //            }
                //        })
                //);
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
                    ng_self.appeditor_open_dialog(true,'保存成功！');

                    var post_data = {}
                    $('.pre_data').each(function(){
                        var key_name = $(this).attr('name');
                        var key_val = '';
                        if ($(this)[0].tagName == 'INPUT') {
                            key_val = $(this).val();
                        } else if ($(this)[0].tagName == 'TEXTAREA') {
                            key_val = $(this).text();
                        }
                        post_data[key_name] = key_val;
                    });
                    post_data = $.extend({}, ng_self.user_data, post_data);

                    ng_self._load(ng_self.options.save_page_api,'post',post_data,function(flag,respone){
                        console.log(respone);
                    });
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
                            var pages = respone.info;


                            if (flag) {
                                for(var loop_index in pages) {
                                    var page_id = pages[loop_index].page_id;
                                    if(!default_page_id) default_page_id = page_id;
                                    var html_str = [];
                                    html_str.push('<div class="ng_page_item" id="'+page_id+'" >');
                                    html_str.push('<div class="ng_page_snapshot"><a rel="'+page_id+'" href="javascript:void(0);"><img src="'+pages[loop_index].snapshot+'"/></a></div>');
                                    html_str.push('<input type="hidden" name="ng_pages[]" value="'+pages[loop_index].path+'">');
                                    html_str.push('<div class="ng_page_item_title">'+pages[loop_index].title+'</div>');
                                    html_str.push('</div>');
                                    $('#ng_page').append(html_str.join(''));
                                }
                                //默认点击第一个。
                            } else {
                                default_page_id = 'index';
                                var html_str = [];
                                html_str.push('<div class="ng_page_item" id="'+default_page_id+'" >');
                                html_str.push('<div class="ng_page_snapshot"><a rel="'+default_page_id+'" href="javascript:void(0);"><img src=""/></a></div>');
                                html_str.push('<input type="hidden" name="ng_pages[]" value="pages\\index\\'+default_page_id+'">');
                                html_str.push('<div class="ng_page_item_title">'+default_page_title+'</div>');
                                html_str.push('</div>');
                                $('#ng_page').append(html_str.join(''));
                            }
                            //bind page event

                            $("#ng_page .ng_page_snapshot a").click(function(){
                                var btn_self = this;
                                var rel = $(btn_self).attr('rel');
                                rel = ng_self.trim(rel);
                                var post_data = $.extend({}, {'page_id':rel}, ng_self.user_post_data);
                                if (ng_self.options.debug) {
                                    console.log('page:'+rel+' on click');
                                }
                                var current_rel = $('#pl_miniapp_header').attr('rel');
                                current_rel = ng_self.trim(current_rel);

                                if (typeof sessionStorage !='object') {
                                    alert('请使用Firefox ，Chrome 支持H5的storage浏览器');
                                    return;
                                }

                                if (current_rel!=rel) {
                                    //先从storeage获取
                                    var storage_data = sessionStorage.getItem(rel);
                                    if(storage_data) {
                                        storage_data = JSON.parse(storage_data);
                                        console.log('from storage:'+rel);

                                        var storage_window_data_str = sessionStorage.getItem('ng_window');
                                        console.log('----ng_window---');
                                        console.log(storage_window_data_str);
                                        console.log('----ng_window end---');
                                        var storage_window_data = JSON.parse(storage_window_data_str);

                                        var page_window = storage_window_data || storage_data.window;

                                        var page_show_title = page_window.navigationBarTitleText;
                                        $('#pl_miniapp_header').attr('rel',rel);
                                        $('#pl_miniapp_header').css('background-color',page_window.navigationBarBackgroundColor);
                                        $('#pl_miniapp_container .pl_miniapp_title').text(page_show_title).css('color',page_window.navigationBarTextStyle);
                                        ng_self.page_layout('#pl_miniapp_main',storage_data.page,storage_data.style);


                                        ng_self.attr_edit_global(storage_window_data);
                                    } else {
                                        //然后再从
                                        ng_self._load(ng_self.options.build_page_info_api,'post',post_data,function(flag,respone){
                                            console.log('from network:'+rel);
                                            if(typeof respone.info == 'object') {
                                                sessionStorage.setItem(rel,JSON.stringify(respone.info));
                                                sessionStorage.setItem('ng_window',JSON.stringify(respone.info.window))
                                                var page_window = respone.info.window;
                                                var page_show_title = page_window.navigationBarTitleText;
                                                $('#pl_miniapp_header').attr('rel',rel);
                                                if(flag) {
                                                    $('#pl_miniapp_header').css('background-color',page_window.navigationBarBackgroundColor);
                                                    $('#pl_miniapp_container .pl_miniapp_title').text(page_show_title).css('color',page_window.navigationBarTextStyle);
                                                } else {
                                                    $('#pl_miniapp_container .pl_miniapp_title').text(default_page_title);
                                                }
                                                ng_self.page_layout('#pl_miniapp_main',respone.info.page,respone.info.style);
                                                ng_self.attr_edit_global(respone.info.window);
                                            }

                                            //build the page

                                        });
                                    }


                                }

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
                            respone = respone.info;
                            if (flag) {
                                var query_user_data = '';
                                var query_user_datas = [];
                                for(var ukey in ng_self.user_data) {
                                    query_user_datas.push(ukey+'='+ng_self.user_data[ukey]);
                                }
                                query_user_data = query_user_datas.join('&');
                                for(var index in respone) {
                                    var plugin_id = respone[index]['class_name']+'_'+respone[index]['plugin_id'];
                                    var plugin_call_api = ng_self.options.plugins_call_api+'&pl_name='+respone[index]['class_name']+'&pl_act=lists&pl_id='+respone[index]['plugin_id'];
                                    plugin_call_api += '&'+query_user_data;
                                    plugin_call_api = plugin_call_api+'&token='+ng_self.options.token+'&_t='+new Date().getTime();
                                    var html_str = [];
                                    html_str.push('<div class="ng_plugin_item" id="'+plugin_id+'" >');
                                    html_str.push('<div class="ng_plugin_item_icon"><a rel="'+plugin_id+'" href="javascript:open_frame_dialog(\''+plugin_call_api+'\',\''+respone[index].name+'\',editor.plugin_append);"><img src="'+respone[index]['icon']+'"/></a></div>');
                                    html_str.push('<div class="ng_plugin_item_title">'+respone[index].name+'</div>');
                                    html_str.push('</div>');
                                    $('#ng_componer').append(html_str.join(''));
                                }
                            }
                            $('#ng_componer').attr('is_loaded','loaded');

                            //bind componer event

                        })
                    );
                }
            }
        }

        this.handle_attr_tag = function(index) {
            $('a.ng_attr_tag').each(function(){
                var a_obj = this;
                $(a_obj).removeClass('ng_btn_active');
                $(a_obj).click(function(){
                    $('a.ng_attr_tag').each(function(){
                        $(this).removeClass('ng_btn_active');
                    });
                    $('#pl_right_container .ng_tag_ctl').each(function(k,v){
                        $(v).css({'display':'none'});
                    });
                    $(a_obj).addClass('ng_btn_active');
                    var rel = $(a_obj).attr('rel');
                    $('#'+rel).css({'display':'block'});

                    var load_func = eval('ng_self.get_'+rel);
                    if (typeof load_func == "function") {
                        console.log('load:'+'ng_self.get_'+rel);
                        load_func();
                    }
                });
            });
            $('a.ng_attr_tag').get(index).click();
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
                        console.log('load:'+'ng_self.get_'+rel);
                        load_func();
                    }
                });
            });
            $('a.ng_tag').get(index).click();
        };

        this.dubug_post = function()
        {
            var test_url = 'http://work.crab.com/wxapp/debug.php/api/123456/workapp?act=test';
            ng_self._load(test_url,'post',ng_self.user_data,function(flag,respone) {

            });
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
                beforeSend: function(request) {
                    request.setRequestHeader("NGTOKEN",ng_self.options.token);
                },
                success: function (respone) {
                    if (typeof  respone =='string') {
                        respone = eval('['+respone+']')[0];
                    }
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

            this.clean_cache('#ng_clean_cache');

            setTimeout(function(){
                $('#pl_mark').css('display','none');
            },1000);

            this.handle_attr_tag(0);
            this.hire();

            //this.dubug_post();
            return this;
        }

    }

    window.NG_EDITOR = NgEditor;
    //$.fn.ng_editor = function(options) {
    //    var ng_editor = new NgEditor(this, options);
    //    return ng_editor.init();
    //}
})(jQuery,window,document,html2canvas,Wind);