/*! numbered v1.0.0 | pavel-yagodin | MIT License | https://github.com/CSSSR/jquery.numbered */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}(function($) {
	$.fn.numbered = function(method, _options){
		var $this = $(this);
		if (method === 'validate') {
			var isValid = 1;
			$this.each(function(){
				var numbered = $(this).data('numbered');
				if ( numbered.validate < isValid ) {
					isValid = numbered.validate;
				}
			});
			return isValid;
		}

		if (typeof _options === 'undefined'){
			_options = method;
		}
		var options = _options;

		var getSelectionRange = function (oElm) {
			var r = { text: '', start: 0, end: 0, length: 0 };
			if (oElm.setSelectionRange) {
				r.start= oElm.selectionStart;
				r.end = oElm.selectionEnd;
				r.text = (r.start != r.end) ? oElm.value.substring(r.start, r.end): '';
			} else if (document.selection) {
				if (oElm.tagName && oElm.tagName === 'TEXTAREA') {
					var oS = document.selection.createRange().duplicate();
					var oR = oElm.createTextRange();
					var sB = oS.getBookmark();
					oR.moveToBookmark(sB);
				} else {
					var oR = document.selection.createRange().duplicate();
				}

				r.text = oR.text;
				for (; oR.moveStart('character', -1) !== 0; r.start++);
				r.end = r.text.length + r.start;
			}
			r.length = r.text.length;
			return r;
		}

		$this.each(function(){
			var is = true;
			var $input = $(this);
			var numbered = $input.data('numbered');
			if (typeof numbered === 'undefined') {
				numbered = $.extend({
					mask: '+7 (###) ### - ## - ##',
					maskKey: '#',
					maskEmpty: '_',
					placeholder: $input.attr('placeholder') || '',
					validateClass: 'valid',
					errorClass: 'error'
				}, options);
				is = false;
			} else {
				numbered = $.extend(numbered, options);
			}
			numbered.data = {};


			numbered.data.placeholder = numbered.mask.replace(new RegExp(numbered.maskKey, 'g'), numbered.maskEmpty);
			numbered.data.maskKey = numbered.maskKey.replace(/([()[\]\.^\#$|?+-])/g, '\\\\$1');
			numbered.data.maskKeyCol = numbered.mask.split(numbered.maskKey).length -1;
			numbered.data.maskEmpty = numbered.maskEmpty.replace(/([()[\]\.^\#$|?+-])/g, '\\$1');
			numbered.data.mask = numbered.mask.replace(/([()[\]\.^\#$|?+-])/g, '\\$1').replace(new RegExp(numbered.data.maskKey, 'g'), '(\\d)');
			numbered.data.maskNums = numbered.mask.replace(/[^\d]/gi, '').split('');
			numbered.data.maskNumsCol = numbered.data.maskNums.length;
			numbered.data.regexp = new RegExp('^' + numbered.data.mask + '$');
			$input.data('numbered', numbered);
			if (!is) {
				$input.on({
					'input.numbered keyup.numbered change.numbered focusin.numbered blur.numbered click.numbered': function(event) {
						var value = this.value;
						var valueFormatted = '';
						var positionStart = -1;
						var positionEnd = -1;

						var positionOld = getSelectionRange($input[0]);

						valueFormatted = value.replace(/[^\d]/gi, '').split('').join('');
						var valueFormattedArr = valueFormatted.split('');
						var valueFormattedCol = valueFormattedArr.length;
						var valueFormattedIndex = 0;
						var maskNumsIndex = 0;
						var valueFormattedRes = [];

						$.each(numbered.mask.split(''), function (key, val) {
							if (
								maskNumsIndex <= numbered.data.maskNumsCol &&
								val == numbered.data.maskNums[maskNumsIndex] &&
								val == valueFormattedArr[valueFormattedIndex]
							) {
								valueFormattedRes.push(val);
								maskNumsIndex++;
								valueFormattedIndex++;
							} else if(val == numbered.maskKey){
								if (positionStart < 0) {
									positionStart = key;
								}
								if(valueFormattedIndex < valueFormattedCol){
									valueFormattedRes.push(valueFormattedArr[valueFormattedIndex]);
									valueFormattedIndex++;
									positionEnd = key;
								}else{
									valueFormattedRes.push(numbered.maskEmpty);
								}
							} else {
								valueFormattedRes.push(val);
							}
						});
						value = valueFormattedRes.join('');

						var position = (positionEnd >= 0 ? positionEnd + 1 : positionStart);
						this.value = value;


						if(event.type !== 'change' && event.type !== 'blur'){
							if ($input[0].setSelectionRange) {
								$input[0].setSelectionRange(position, position);
							} else if ($input[0].createTextRange) {
								var range = $input[0].createTextRange();
								range.collapse(true);
								range.moveEnd('character', position);
								range.moveStart('character', position);
								range.select();
							}
						}
						if (numbered.data.regexp.test(value)) {
							numbered.validate = 1;
							$input.trigger('numbered.valid');
						} else if ((event.type === 'change' || event.type === 'blur') && valueFormattedCol <= numbered.data.maskNumsCol) {
							this.value = numbered.placeholder;
							$input.trigger('numbered.empty');
							numbered.validate = 0;
						} else {
							numbered.validate = -1;
							$input.trigger('numbered.invalid');
						}
						$input.data('numbered', numbered);
					}
				}).trigger('blur');
			}
		});
		return this;
	};
}));
