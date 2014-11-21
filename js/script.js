/*global REDIPS, document, $, Dragdealer */
/*jshint globalstrict: true*/
/* enable strict mode */
"use strict";

// global for console access
var lspine = {},	// main object
	dd = {};		// Dragdealer object

$(document).ready(function() {
	var redipsInit,			// define redipsInit
		getContent,			// get content (DIV elements in TD)
		divNodeList,		// node list of DIV elements in table2 (global variable needed in report() and visibility() function)

	lspine = {
		helpers: {},
		table:
			[
			'',
			'b1 n11 r11 r12 r13 r14 r15 r16 r17 n12 s1'.split(' '),	// L1-2
			'b2 n21 r21 r22 r23 r24 r25 r26 r27 n22 s2'.split(' '),	// L2-3
			'b3 n31 r31 r32 r33 r34 r35 r36 r37 n32 s3'.split(' '),	// L3-4
			'b4 n41 r41 r42 r43 r44 r45 r46 r47 n42 s4'.split(' '),	// L4-5
			'b5 n51 r51 r52 r53 r54 r55 r56 r57 n52 s5'.split(' ')	// L5-S1
			]
	};

	dd = {
		sliders: {},
		fullText:
			{
			'ddAf': 'annular fissure',
			'ddDd': 'disc desiccation',
			'ddEp': 'end-plate degenerative changes',
			'ddFjhR': 'right facet joint hypertrophy',
			'ddFjhL': 'left facet joint hypertrophy',
			'ddLft': 'ligamentum flavum thickening',
			'ddL': 'listhesis'
			},
		lSevs: 'Gr 3 Antero/Gr 2 Antero/Gr 1 Antero/None/Gr 1 Retro/Gr 2 Retro/Gr 3 Retro'.split('/'),
		types: 'ddAf/ddDd/ddEp/ddFjhR/ddFjhL/ddLft/ddL'.split('/'),
		levelEnabled: [false, false, false, false, false]
	};

	// redips initialization
	redipsInit = function() {
		var	rd = REDIPS.drag;			// reference to the REDIPS.drag object
		// initialization
		rd.init();
		// REDIPS.drag settings
		rd.dropMode = 'overwrite';
		rd.hover.colorTd = '#9BB3DA';	// set hover color
		rd.clone.keyDiv = true;			// enable cloning DIV elements with pressed SHIFT key
		// prepare node list of DIV elements in table2
		divNodeList = document.getElementById('table2').getElementsByTagName('div');

		rd.event.deleted = function() {
			lspine.update();	// update on deleting DIV
		};

		// element is dropped
		rd.event.dropped = function() {
			var	objOld = rd.objOld,					// original object
				targetCell = rd.td.target,			// target cell
				targetRow = targetCell.parentNode,	// target row
				i,									// local variables
				objNew;
			// if checkbox is checked and original element is of clone type then clone spread throughout the level
			if (document.getElementById('entirelevel').checked === true && objOld.className.indexOf('clone') > -1) {
				// loop through table cells (LINK [formerly BBDB] checkbox)
				// for (i = 0; i < targetRow.cells.length; i++) {
				for (i = 4; i <= 6; i++) {
					// skip cell if cell has some content (first column is not empty because it contains label)
					if (targetRow.cells[i].childNodes.length > 0) {
						continue;
					}
					// clone DIV element
					objNew = rd.cloneObject(objOld);
					// append to the table cell
					targetRow.cells[i].appendChild(objNew);
				}
			}
			lspine.update();	// update on dropping a DIV in a TD
		};
	};

	// get content (DIV elements in a specific TD) [ex27]
	getContent = function(id) {
		var td = document.getElementById(id),
			content = '',
			cn,
			i;
		// TD can contain many DIV elements
		for (i = 0; i < td.childNodes.length; i++) {
			// set reference to the child node
			cn = td.childNodes[i];
			// childNode should be DIV with containing "drag" class name
			if (cn.nodeName === 'DIV' && cn.className.indexOf('drag') > -1) { // and yes, it should be uppercase
				// append DIV id to the result string
				content += cn.id;
			}

			// return INPUT value if the editable DIV named 'bl' is found
			if (cn.className.indexOf('bl') === 5) {
				return document.getElementById(cn.id).getElementsByTagName('input')[0].value;
			}
		}

		// get rid of the trailing clone id "_c0"
		return content.replace(/(c[0-9]+)+$/g,'');
	};

	// ========================== //
	// ====== LSPINE.UPDATE ===== //
	// ========================== //
	lspine.update = function() {
		var curLevel, i, levelsText = [], reportText;

		// ===== CYCLE THROUGH DISC SPACES ===== //
		for (curLevel = 1; curLevel <= 5; curLevel++) {
			levelsText[curLevel] = '';
			getHerniations();
			getNFN();
			getStenosis();
			getOther();
			strManipOther();
		}
		getGlobal();

		// ===== ADD TALKSTATION [BRACKETS] ===== //
		if (document.getElementById('talk-brackets').checked) {	// make sure checkbox is checked
			for (i = 1; i <= 5; i++) {
				levelsText[i] = levelsText[i].addBrackets();
			}
		}

		// ===== GENERATE REPORT ====== //
		reportText =
			'<b>L1-L2</b>: There ' + levelsText[1] + '<br>' +
			'<b>L2-L3</b>: There ' + levelsText[2] + '<br>' +
			'<b>L3-L4</b>: There ' + levelsText[3] + '<br>' +
			'<b>L4-L5</b>: There ' + levelsText[4] + '<br>' +
			'<b>L5-S1</b>: There ' + levelsText[5] + '<br>' +
			'<br>' +
			'<b>CONCLUSION:</b><br><br>';

		// ===== SAVE/RESTORE ADDED TEXT ===== //
		lspine.addedText = /(L5-S1.*?)(<br>.*)/.exec(document.getElementById('textareaReport').innerHTML);
		if (lspine.addedText) reportText = reportText.replace(/(L5-S1.*?)(<br>.*)/, '$1' + lspine.addedText[2]);

		// ===== UPDATE REPORT PREVIEW ===== //
		document.getElementById('textareaReport').innerHTML = reportText;

		// ===== LSPINE.UPDATE FUNCTIONS ===== //
		function getHerniations() {
			var bSev = getContent(lspine.table[curLevel][0]), pText = [], bText = '/////'.split('/'),
				pLocs = '//right foraminal/right subarticular/right central/central/left central/left subarticular/left foraminal'.split('/');
			if (bSev) {
				bText[curLevel] = 'is a ' + bSev + ' broad-based disc bulge';
			}

			for(i = 2; i <= 8; i++) {
				if (getContent(lspine.table[curLevel][i])) {
					pText[pText.length] = getContent(lspine.table[curLevel][i]) + ' ' + pLocs[i];
				}
			}

			// consolidate protrusions into a comma-separated phrase
			switch(pText.length) {
				case 0:
					levelsText[curLevel] = '';
					break;
				case 1:
					if (!bSev) levelsText[curLevel] = 'is ';
					levelsText[curLevel] += 'a ' + pText + ' disc protrusion';
					break;
				case 2:
					if (!bSev) levelsText[curLevel] = 'are ';
					levelsText[curLevel] += pText.join(' and ') + ' disc protrusions';
					break;
				default:
					if (!bSev) levelsText[curLevel] = 'are ';
					levelsText[curLevel] += pText.join(', ') + ' disc protrusions';
			}

			// combine BBDB and protrusion into one sentence
			if(levelsText[curLevel] === '') {
				if(bText[curLevel] === '') {	// no protrusion, no bulge
					levelsText[curLevel] = 'is no disc bulge or protrusion';
				} else {	// no protrusion, + bulge
					levelsText[curLevel] = bText[curLevel];
				}
			} else {
				if(bText[curLevel]) {	// + protrusion, + bulge
					levelsText[curLevel] = bText[curLevel] + ' and ' + levelsText[curLevel];
				} else { // + protrusion, no bulge
					// levelsText already contains protrusion text!
				}
			}
			levelsText[curLevel] += '. ';
		}

		function getNFN() {
			var nTemp = [], nLocs = ['right','left'];
			for(i = 0; i <= 1; i++) {
				if (getContent(lspine.table[curLevel][1+8*i])) {
					nTemp[nTemp.length] = getContent(lspine.table[curLevel][1+8*i]) + ' ' + nLocs[i];
				}
			}

			// consolidate NFNs into a phrase
			switch (nTemp.length) {
				case 0:
					levelsText[curLevel] += 'no';
					break;
				case 1:
					levelsText[curLevel] += nTemp;
					break;
				case 2:
					levelsText[curLevel] += nTemp.join(' and ');
					break;
			}
			levelsText[curLevel] += ' neuroforaminal narrowing. ';
		}

		function getStenosis() {
			levelsText[curLevel] +=
				(getContent(lspine.table[curLevel][10]) || 'no') +
				' spinal canal stenosis. ';
		}

		function getOther() {
			for (i = 0; i <= dd.types.length; i++) {	// cycle through all sliders at each level
				var curSlider = dd.sliders[dd.types[i] + curLevel];

				if (curSlider) {
					var curSliderText = $('#' + dd.types[i] + curLevel + '_handle').text();

					if (curSliderText !== 'None') {
						levelsText[curLevel] +=
							$('#' + dd.types[i] + curLevel + '_handle').text() +
							' ' + dd.fullText[dd.types[i]] + '. ';
					}
				}
			}

			if ($('#cbCsp' + curLevel).is(':checked')) {	// CSP
				levelsText[curLevel] += 'Congenitally short pedicles. ';
			}
		}

		function getGlobal() {
			var gSevSum = 0,
				gSevs = '/Mild/Moderate/Mild-moderate/Severe/Lumbar/Moderate-severe/Lumbar'.split('/');

			if ($('#mild-spon').is(':checked')) gSevSum += 1;
			if ($('#mod-spon').is(':checked')) gSevSum += 2;
			if ($('#sev-spon').is(':checked')) gSevSum += 4;

			levelsText[5] += gSevSum	? '<br><br>' + gSevs[gSevSum] + ' spondylosis throughout.'
										: '';
		}

		function strManipOther() {
			levelsText[curLevel] = levelsText[curLevel]
				.replace(/facet joint hypertrophy, (\w+)\b/ig, '$1 facet joint hypertrophy')	// 'fjh, right' → 'right fjh'
				.replace(/ facet joint hypertrophy. (.*) facet/, ' and $1 facet')
				.replace(/\b(\w+) right and[^\.]*\1 left/ig, '$1 bilateral')
				.replace(/sev /ig, 'severe ')
				.replace(/mod /ig, 'moderate ')
				.replace(/Gr ([0-9])/, 'Grade $1')
				.replace(/o list/, 'olist')
				.replace(/(\. [^\.]*listhesis)/g, '$1 of L' + curLevel + ' on L' + (curLevel + 1))
				.replace(/L6/, 'S1')
				.addOxfordComma();
			levelsText[curLevel] = lspine.helpers.capitalizer(levelsText[curLevel].toLowerCase());
			levelsText[curLevel] = levelsText[curLevel].substring(0, 1).toLowerCase() + levelsText[curLevel].substring(1);
			levelsText[curLevel] = levelsText[curLevel].replace(/ (i+-?i*) /ig, String.call.bind(levelsText[1].toUpperCase));
			levelsText[curLevel] = levelsText[curLevel].replace(/l([0-9])/g, 'L$1');
			levelsText[curLevel] = levelsText[curLevel].replace(/s([0-9])/g, 'S$1');
		}

	};

	// ===== ADD TALKSTATION [BRACKETS] ===== //
	String.prototype.addBrackets = function() {
		return this	.replace(/(mild|moderate|severe|minimal|no disc bulge or protrusion.|No neuroforaminal narrowing\.|No spinal canal stenosis\.)/ig, '[$1]')
					.replace(/(\[mild\]-\[moderate\]|\[moderate\]-\[severe\]|\[mild\]-\[severe\])/ig, '[$1]')
					.replace(/Grade ([0-9])/i, 'Grade [$1]')
					.replace(/b><br>(.*\.)<br>/igm, 'b><br>[$1]<br>');
	};

	String.prototype.addOxfordComma = function() {
		return this.replace(/,(?=[^,]*$)/, ', and');
	};

	// ===== SELECT ALL BUTTON ===== //
	lspine.selectAll = function() {
		document.getElementById('textareaReport').focus();
		document.execCommand('SelectAll');
	};

	// ===== RESET BUTTON ===== //
	lspine.reset = function() {
		var i, j, allLevelCBs = ['mild-spon', 'mod-spon', 'sev-spon'];

		for (i = 1; i <= 5; i++) {
			// clear main table
			for (j = 0; j < 11; j++) {
				REDIPS.drag.emptyCell(document.getElementById(lspine.table[i][j]));
			}

			// reset dd.sliders
			if (dd.levelEnabled[i]) {	// check if level is initialized, else will get error
				for (j = 0; j < dd.types.length - 1; j++) {
					dd.sliders[dd.types[j] + i].setValue(0, 0, true);
				}
				// reset -listhesis to 'none'
				dd.sliders[dd.types[dd.types.length - 1] + i].setValue(0.5, 0, true);
			}
		}

		// clear "other" checkboxes
		for (i = 1; i <= 5; i++) {
			document.getElementById('cbCsp' + i).checked = false;
		}

		// clear "all levels" checkboxes
		for (i = 0; i < allLevelCBs.length; i++) {
			document.getElementById(allLevelCBs[i]).checked = false;
		}

		// clear remaining checkboxes
		document.getElementById('entirelevel').checked = false;
		document.getElementById('talk-brackets').checked = false;

		// clear textarea (needed for saving/restoring added text)
		document.getElementById('textareaReport').innerHTML = '';
		lspine.update();
	};

	// ===== CAPITALIZE FIRST LETTER OF SENTENCE ===== //
	lspine.helpers.capitalizer = function(myString) {
		return myString.replace(/(^\w{1}|\.\s*\w{1})/gi, function(toReplace) {
			return toReplace.toUpperCase();
		});
	};

	// initialize 'instructions' / 'quick ref' Colorboxes
	$('a.cb').colorbox({
		opacity: 0.5,
		width: "750px",
		height: "350px"
	});

	// initialize 'Other findings' Colorbox
	$('.inline').colorbox({
		inline: true,
		width: "280px",
		height: "585px",
		opacity: 0.4,
		speed: 0,
		left: "700px",
		top: "50px",
		onComplete:function() {
			var curLevel = this.id.substring(2) * 1;	// this.id = 'of2'
			if (!dd.levelEnabled[curLevel]) {
				dd.init(curLevel);						// initialize dd.sliders at curLevel if not already done
			}
		}
	});

	// initialize dd.sliders
	dd.init = function(curLevel) {	// called by $('.inline').colorbox only if curLevel isn't yet initialized
		var i;

		// call helper function to create dd.sliders with default parameters
		for (i = 0; i < dd.types.length - 1; i++) {
			dd.initHelper(i, curLevel);
		}

		// create listhesis dd.sliders
		dd.sliders['ddL' + curLevel] = new Dragdealer ('ddL' + curLevel, {
			steps: 7,
			snap: false,
			x: 0.5,
			animationCallback: function(x, y) {
				var nL = dd.lSevs.length - 1,
					anteroColor =	[41, 128, 185],
					noneColor =		[255, 255, 255],
					retroColor =	[192, 57, 43],
					rgb = [];

				$('#ddL' + curLevel + '_handle').html(dd.lSevs[Math.floor((x + (1/(2*nL))) * nL)]);

				switch(true) {
					case (x < 0.5):
						for (i = 0; i < 3; i++) {
							rgb[i] = anteroColor[i] + (255 - anteroColor[i]) * x;
						}
						break;
					case (x === 0.5):
						rgb = noneColor;
						break;
					case (x > 0.5):
						for (i = 0; i < 3; i++) {
							rgb[i] = 255 - 2 * (255 - retroColor[i]) * (x - 0.5);
						}
						break;
				}
				$('#ddL' + curLevel + '_handle').css('background-color', 'rgb(' + parseInt(rgb[0], 10) + ', ' + parseInt(rgb[1], 10) + ', ' + parseInt(rgb[2], 10) + ')');
				lspine.update();
			}
		});

		dd.levelEnabled[curLevel] = true;	// only do it once per session so values aren't lost
	};

	// helper function to deal with closure inside loops while creating dd.sliders
	dd.initHelper = function(_i, _curLevel) {
		dd.sevs = 'None/Mild/Mod/Sev'.split('/');
		var n = dd.sevs.length - 1;

		// create dd.sliders with default parameters
		dd.sliders[dd.types[_i] + _curLevel] = new Dragdealer (dd.types[_i] + _curLevel, {
			steps: 4,
			snap: false,
			animationCallback: function(x, y) {
				$('#' + dd.types[_i] + _curLevel + '_handle')
					.html(dd.sevs[Math.floor((x + (1/(2*n))) * n)])
					.css("background-color", "rgb(255, " + parseInt(305*(1-x), 10) + ", " + parseInt(305*(1-x), 10) + ")");
				lspine.update();
			}
		});
	};

	$('body').on('keyup', '.bl_text_class', function() {
		lspine.update();
	});

	$('input').click(function() {
	// $('#conclusion, #talk-brackets, #mild-spon, #mod-spon, #sev-spon').click(function() {
		lspine.update();
	});

	$('#resetbtn').click(function() {
		lspine.reset();
	});

	$('#selectAllbtn').click(function() {
		lspine.selectAll();
	});

	// hover over first row labels to display reference image
	$(".hover").hover(
		//hover() fn 1 = onmouseover
		function(e) {
			var imageFilenames =
				{
					"Broad-based disc bulge":				"bbdb",
					"Right foraminal disc protrusion":		"rfdp",
					"Right subarticular disc protrusion":	"rsadp",
					"Right central disc protrusion":		"rcdp",
					"Central disc protrusion":				"cdp",
					"Left central disc protrusion":			"lcdp",
					"Left subarticular disc protrusion":	"lsadp",
					"Left foraminal disc protrusion":		"lfdp"
				};

			$("body").append(
				"<p id='hoverImage'><img src='img/" +
				imageFilenames[this.title] +
				".jpg'/></p>");
			$("#hoverImage")
				.css("position", "absolute")
				.css("top", (e.pageY - 15) + "px")
				.css("left", (e.pageX - 50) + "px")
				.css("transform", "scale(0.75)")
				.fadeIn("fast");
		},
		// hover() fn 2 = onmouseout
		function() {
			$("#hoverImage").remove();
		});

	// reference images follow mouse cursor
	$(".hover").mousemove(function (e) {
		$("#hoverImage")
			.css("top", (e.pageY - 15) + "px")
			.css("left", (e.pageX - 20) + "px");
	});

	document.getElementById('entirelevel').checked = false;
	redipsInit();
	lspine.update();
});
