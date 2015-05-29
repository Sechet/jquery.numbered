/*! numbered v0.1.7 | pavel-yagodin | MIT License | https://github.com/CSSSR/jquery.numbered */
(function($){
	jQuery.fn.numbered = function(options){
		options = $.extend({
			mask: '+7 (###) ### - ## - ##',
			maskKey: '#',
			empty: '_',
			wrapClass: 'numbered__wrap',
			spanClass: 'numbered__mask',
			wrapFocusClass: 'numbered__wrap_active',
			wrapPlaceholderClass: 'numbered__wrap_placeholder',
			wrapDisableClass: 'numbered__wrap_disable',
			wrapMaskClass: 'numbered__wrap_mask',
			inputClass: 'numbered',
			errorClass: 'numbered_error',
			attr: 'data-numbered',
			attrPlaceholder: 'data-placeholder',
			placeholder: false
		}, options);
		var pluginName = 'numbered',
			pluginValue = 'numberedValue',
			dataPlugin = 'plugin_' + pluginName;
		var getIndex = function(data, pos){
			var index = 0,
				degPos = [];
			for (var key in data.options.mask) {
				if (data.options.mask[key] === data.options.maskKey) {
					degPos.push(key);
				}
			}
			index = 0;
			for (var key in degPos) {
				if (+degPos[key] < pos){
					index = +key + 1;
				}
			}
			return parseInt(index);
		};
		var getPos = function(data, index){
			var pos = 0,
				j = 0;
			for (var key in data.options.mask) {
				if (data.options.mask[key] === data.options.maskKey && j <= index) {
					j++;
					pos = key;
				}
			}
			return parseInt(pos);
		};
		var make = function(data, type, position){
			var _this = data,
				opts = _this.options,
				$input = _this.$input,
				$wrap = _this.$wrap,
				$span = _this.$span,
				value = $input.data(pluginValue),
				valueWithMask = '',
				i = 0;
			if(value.length !== opts.max){
				$input.addClass(opts.errorClass);
			} else {
				$input.removeClass(opts.errorClass);
			}
			if( type === 'input' || ( type !== 'input' && value.length !== 0) ) {
				var find = false;
				for (var key in opts.mask) {
					var val = opts.mask[key];
					if (val !== opts.maskKey) {
						valueWithMask += val;
					} else {
						if (value[i] === undefined) {
							if(opts.empty !== false){
								if(!find){
									_this.posFocus = key;
									find = true;
								}
								valueWithMask += opts.empty;
							}else{
								break;
							}
						}else{
							valueWithMask += value[i];
							i++;
						}
					}
					if(!find){
						_this.posFocus = key+1;
					}
				}
			}
			valueWithMask = valueWithMask.substr(0, opts.mask.length);
			if (!/Android/i.test(navigator.userAgent)) {
				if (type === 'caret') {
					var cursorPos = null;
					if (document.selection) {
						var range = document.selection.createRange();
						range.moveStart('textedit', -1);
						cursorPos = range.text.length;
					} else {
						cursorPos = $input[0].selectionStart;
					}
					if (cursorPos < _this.posFocus) {
						_this.posFocus = cursorPos;
					}
				}
				if (position !== undefined) {
					_this.posFocus = position;
				}
			}else{
				var val = data.$input.data(pluginValue)
				_this.posFocus = getPos(data, val.length);
				if(val.length === data.options.max){
					_this.posFocus++;
				}
			}
			if(type !== 'focusout' && $input.val() !== valueWithMask){
				$input.val(valueWithMask);
			}
			$wrap.attr(opts.attr, valueWithMask);
			$span.html(valueWithMask.replace(/ /g, '&nbsp;'));
			if(type !== 'focusout'){
				$wrap.addClass(opts.wrapFocusClass);
				$wrap.removeClass(opts.wrapPlaceholderClass);
				$wrap.removeClass(opts.wrapMaskClass);
				if ($input[0].setSelectionRange) {
					$input[0].setSelectionRange(_this.posFocus, _this.posFocus);
				} else if ($input[0].createTextRange) {
					var range = $input[0].createTextRange();
					range.collapse(true);
					range.moveEnd('character', _this.posFocus);
					range.moveStart('character', _this.posFocus);
					range.select();
				}
			} else {
				var text = value.join('');
				$input.val(text);
				$wrap.removeClass(opts.wrapFocusClass);
				if($wrap.attr(opts.attrPlaceholder) !== '' && text.length === 0){
					$wrap.addClass(opts.wrapPlaceholderClass);
					$span.html($wrap.attr(opts.attrPlaceholder));
				} else {
					$wrap.addClass(opts.wrapMaskClass);
				}
			}
			opts.chars = false;
			return _this;
		};
		$(this).each(function(){
			var data = {};
			data.$input = $(this);
			data.paste = false;
			data.chars = false;
			data.pasteOld = '';
			data.posFocus = 0;
			data.keyState = false;
			data.placeholder = options.placeholder;
			if(data.$input.attr('placeholder') !== undefined && data.$input.attr('placeholder') !== '' && data.placeholder === false){
				data.placeholder = data.$input.attr('placeholder');
			}
			if(data.placeholder !== false){
				data.$input.attr('data-placeholder', data.placeholder);
			}
			data.$input.attr('placeholder', '');

			if( typeof options.mask === 'string'){
				options.max = (options.mask).split(options.maskKey).length - 1;
				options.mask = (options.mask).split('');
			}
			data.options = options;
			data.value = data.$input.val().replace(/\D/, '');
			data.value = (data.value.substr(0, options.max)).split('');

			if(data.$input.data('numbered')==='init'){
				data.$input
					.data(pluginValue, data.value)
			}else{
				data.$input
					.data(pluginValue, data.value)
					.data('numbered', 'init')
					.attr('autocomplete', 'off')
					.addClass(options.inputClass)
					.wrap('<div class="'+options.wrapClass+'"></div>');

				data.$wrap = data.$input.parent();
				data.$wrap.append('<span class="'+options.spanClass+'"></span>');
				data.$span = data.$wrap.find('span');
				data.$wrap
					.on('click', function(){
						data.$input.focus();
					});
				if (/Android/i.test(navigator.userAgent)) {
					data.$input.attr('type', 'tel')
					if(/Android 4.0/i.test(navigator.userAgent)){
						data.options.empty = ' '
					}
				}

				if (/Android/i.test(navigator.userAgent) && /YaBrowser/i.test(navigator.userAgent) ) {
					var text = '';
					for (var key in data.options.mask) {
						var val = data.options.mask[key];
						if(val === data.options.maskKey){
							text += (data.options.empty!==false)?data.options.empty:'_';
						}else{
							text += val;
						}
					}
					data.$span.html(text);
					data.$input.on('focus.numbered input.numbered', function(e) {
						data.$input.val(data.$input.val());
						data.$wrap.addClass(data.options.wrapFocusClass);
					});
					data.$input.on('focusout.numbered', function(e) {
						if(this.value === ''){
							data.$wrap.removeClass(data.options.wrapFocusClass);
						}else{
							data.$wrap.addClass(data.options.wrapFocusClass);
						}
					});
					data.$input.trigger('focusout');

				} else {
					data.$wrap.attr(options.attrPlaceholder, (data.placeholder===false)?'':data.placeholder);
					$(window).on('beforeunload.numbered', function(){
						data.$input.trigger('focusout');
					});
					data.$input
						.on('change.numbered', function() {
							data.value = this.value.replace(/\D/, '');
							data.value = (data.value.substr(0, options.max)).split('');
							data.$input
								.data(pluginValue, data.value);
							data.posFocus = getPos(data, data.value.length);
							data = make(data, 'change');
						})
						.on('focusout.numbered', function() {
							data = make(data, 'focusout');
						})
						.on('paste.numbered', function() {
							data.paste = true;
							data.pasteOld = data.$input.val();
							setTimeout(function(){
								var val = data.$input.data(pluginValue)
								data.posFocus = getPos(data, val.length);
								data = make(data, 'input');
								console.log(': '+data.value)
							}, 10);
							console.log('test')

						})
						.on('keyup.numbered click.numbered focusin.numbered input.numbered', function(e) {

							console.log(e.type+': '+data.value)
							if($(this).attr('readonly') === 'readonly'){
								return false;
							}
							if(!data.options.chars){
								if (data.paste) {
									if (e.type == 'input') {
										var value = data.$input.data(pluginValue),
											paste = data.$input.val();
										if (data.posFocus !== 0) {
											paste = paste.substr(data.posFocus);
										} else {
											paste = paste.replace(data.pasteOld, '');
										}
										for (var key in paste) {
											var val = paste[key];
											if(value.length < data.options.max && parseInt(val) >= 0){
												value.push(val);
											}
										}
										data.$input.data(pluginValue, value);
										data.paste = false;
									}
								}

								if(e.type === 'click' && data.focus){
									data = make(data, 'caret');
								} else {
									data = make(data, 'input', data.posFocus);
								}
							}
							if(e.type === 'focusin'){
								data.focus = true;
							}
							if(e.type === 'keyup'){
								data.focus = true;
							}

						})
						.on('input.numbered', function(e) {
							return false;
						})
						.on('keydown.numbered', function(e) {
							if(e.ctrlKey && e.keyCode === 86){
								return true;
							}
							if($(this).attr('readonly') === 'readonly'){
								return false;
							}
							if (e.keyCode !== 9) {
								e.preventDefault();
							}else{
								return true;
							}
							if(!data.options.chars){
								data.options.chars = true;
								var value = data.$input.data(pluginValue),
									newChar = '';
								if (e.keyCode <= 105 && e.keyCode >= 96) {
									newChar = (e.keyCode-96)+'';
								}
								if (e.keyCode <= 57 && e.keyCode >= 48 && !e.shiftKey) {
									newChar = (e.keyCode-48)+'';
								}
								if(/^\d$/.test(String.fromCharCode(e.which)) && !e.shiftKey){
									newChar = String.fromCharCode(e.which);
								}
								if (e.keyCode == 8) {
									pos = getIndex(data, data.posFocus);
									if ( pos > 0 ) {
										value.splice(pos-1, 1);
										data.posFocus = getPos(data, pos-1);
									}
								}
								if (e.keyCode == 46) {
									pos = getIndex(data, data.posFocus);
									value.splice(pos, 1);
								}
								if(e.keyCode == 36 || e.keyCode == 38){
									data.posFocus = getPos(data, 0);
								}
								if(e.keyCode == 35 || e.keyCode == 40){
									data.posFocus = getPos(data, value.length);
									if( value.length === data.options.max ){
										data.posFocus++;
									}
								}
								if(e.keyCode == 37){
									pos = getIndex(data, data.posFocus);
									if (pos > 0) {
										pos--;
									}
									data.posFocus = getPos(data, pos);
								}
								if(e.keyCode == 39){
									pos = getIndex(data, data.posFocus);
									if( pos < value.length ){
										pos++;
									}
									data.posFocus = getPos(data, pos);
								}
								if (newChar !== '') {
									if(value.length < data.options.max){
										pos = getIndex(data, data.posFocus);
										value.splice(pos, 0, newChar);
										data.posFocus = getPos(data, pos+1);
										if(value.length == data.options.max){
											data.posFocus++;
										}
									}
								}
								data.$input.data(pluginValue, value);
								data = make(data, 'input', data.posFocus);
							}else{
								e.preventDefault();
							}
							return false;
						});
					data.posFocus = getPos(data, 0);
					data = make(data, 'focusout');
				}
			}
		});
		return this;
	};
})(jQuery);
