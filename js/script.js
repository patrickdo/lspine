/*global window: false, REDIPS: true */
/* enable strict mode */
"use strict";

var redipsInit,			// define redipsInit 
	report_update,		// update report
	report_selectAll,	// transmit report
	report_reset,		// reset report
	capitalizer,		// capitalize first word of every sentence
	getContent,			// get content (DIV elements in TD)
	divNodeList;		// node list of DIV elements in table2 (global variable needed in report() and visibility() function)

// redips initialization
redipsInit = function () {
	var	rd = REDIPS.drag;			// reference to the REDIPS.drag object
	// initialization
	rd.init();
	// REDIPS.drag settings
	rd.dropMode = 'overwrite';
	rd.hover.colorTd = '#9BB3DA';	// set hover color
	rd.clone.keyDiv = true;			// enable cloning DIV elements with pressed SHIFT key
	// prepare node list of DIV elements in table2
	divNodeList = document.getElementById('table2').getElementsByTagName('div');

	report_update();	// update on initialization

	rd.event.deleted = function () {
		report_update();	// update on deleting DIV
	};

	// element is dropped
	rd.event.dropped = function () {
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
		
		report_update();	// update on dropping a DIV in a TD
	};

};


// add onload event listener
if (window.addEventListener) {
	window.addEventListener('load', redipsInit, false);
} else if (window.attachEvent) {
	window.attachEvent('onload', redipsInit);
}


// get content (DIV elements in a specific TD) [ex27]
getContent = function (id) {
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
			content += cn.id + '_';
		}

		// 7/24/14
		// cn.className.indexOf('bl') == 5 if cell contains the editable DIV (w/ input box)
		// cn.id is the ID of the DIV
		// cells contain DIVs, which contain INPUT
		// http://stackoverflow.com/questions/3586305/get-all-input-fields-inside-div-without-js-library

		// return INPUT value if the editable DIV named 'bl' is found
		if (cn.className.indexOf('bl') === 5) {
			return content = document.getElementById(cn.id).getElementsByTagName('input')[0].value;
		}

	}

	// 7/18/14 get rid of the trailing "_c0"
	content = content.substring(0, content.length - 3);
	return content;
};



// ========================== //
// ====== REPORT_UPDATE ===== //
// ========================== //
report_update = function () {
	//===DEFINE VARIABLES===//
	var report_text, i, levels_text = [], h_text = [], n_text = [], s_text = [], o_text = [], b_text = [], curlevel, n_sev = [], s_sev, b_sev = [], other = [], p_text = [],

	// IDs of right table cells. first row blank so that levels[1] = L1-2 level
	levels =
		[
		' / / / / '.split('/'),
		'r10 r11 r12 r13 r14 r15 r16 r17'.split(' '),	// L1-2
		'r20 r21 r22 r23 r24 r25 r26 r27'.split(' '),	// L2-3
		'r30 r31 r32 r33 r34 r35 r36 r37'.split(' '),	// L3-4
		'r40 r41 r42 r43 r44 r45 r46 r47'.split(' '),	// L4-5
		'r50 r51 r52 r53 r54 r55 r56 r57'.split(' ')	// L5-S1
		],
	
	// IDs of right table - 'Other' column - multipleSelect
	others =
		' #o1 #o2 #o3 #o4 #o5'.split(' '),
	
	// IDs of right table 'BBDB' cells - combine with var levels eventually?
	b_levels = 
		' /b1/b2/b3/b4/b5'.split('/'),
	
	// first col blank so that plocations[1] = 'R foraminal' (skipping 'R NF narrowing')
	plocations =
	['',
	'right foraminal',
	'right central',
	'central',
	'left central',
	'left foraminal'],
	
	// NFN locations
	nlocations =
	['right','left'];

	
	//===INITIALIZATION===//
	for (i = 1; i <= 5; i++) {
		b_text[i] = '';
		h_text[i] = '';
		n_text[i] = '';
		s_text[i] = 'no spinal canal stenosis';
		o_text[i] = '';
	}		
	
	
	//===CYCLE THROUGH DISC SPACES===//
	for (curlevel = 1; curlevel <= 5; curlevel++) {

		// DISC HERNIATIONS //
		// BBDB
		b_sev = getContent(b_levels[curlevel]);
		if (b_sev) {
			b_text[curlevel] = 'is a ' + b_sev + ' broad-based disc bulge';
		}
		
		// protrusions
		p_text = [];
		for(i = 1; i <= 5; i++) {
			if (getContent(levels[curlevel][i])) {
				p_text[p_text.length] = getContent(levels[curlevel][i]) + ' ' + plocations[i];
			}
		}
		
		// consolidate protrusions into a comma-separated phrase
		switch(p_text.length) {
			case 0:
				h_text[curlevel] = '';
				break;
			case 1:
				h_text[curlevel] = ' is a ' + p_text + ' disc protrusion';
				if (b_sev) {
					h_text[curlevel] = 'a ' + p_text + ' disc protrusion';
				}
				break;
			case 2:
				h_text[curlevel] = 'are ' + p_text.join(' and ') + ' disc protrusions';
				if (b_sev) {
					h_text[curlevel] = p_text.join(' and ') + ' disc protrusions';
				}
				break;
			default:
				h_text[curlevel] = 'are ' + p_text.join(', ') + ' disc protrusions';
				if (b_sev) {
					h_text[curlevel] = p_text.join(', ') + ' disc protrusions';
				}
		}
	
		// combine BBDB and protrusion into one sentence
		if(h_text[curlevel] === "") {
			if(b_text[curlevel] === '') {	// no protrusion, no bulge
				h_text[curlevel] = "is no disc bulge or protrusion";
			} else {	// no protrusion, + bulge
				h_text[curlevel] = b_text[curlevel];
			}
		} else {
			if(b_text[curlevel]) {	// + protrusion, + bulge
				h_text[curlevel] = b_text[curlevel] + ' and ' + h_text[curlevel];
			} else { // + protrusion, no bulge
				// h_text already contains protrusion text!
			}
		}


		// NEUROFORAMINAL NARROWING //
		var n_temp = [];
		for(i = 0; i <= 1; i++) {
			n_sev[i] = getContent(levels[curlevel][6*i]).replace(/c[0-9]/g, '');
			
			if (n_sev[i]) {
				n_temp[n_temp.length] = getContent(levels[curlevel][6*i]) + ' ' + nlocations[i];
			}
			
			// consolidate NFNs into a phrase
			switch (n_temp.length) {
				case 0:
					n_text[curlevel] = 'no';
					break;
				case 1:
					n_text[curlevel] = n_temp;
					break;
				case 2:
					n_text[curlevel] = n_temp.join(' and ');
					// combine 'X right and X left NFN' into 'X bilateral NFN'
					if (n_sev[0] === n_sev[1] && n_sev[0]) {
						n_text[curlevel] = n_sev[0] + ' bilateral';
					}
					break;
			}
			n_text[curlevel] += ' neuroforaminal narrowing';
		}

		
		// SPINAL CANAL STENOSIS //
		s_sev = getContent(levels[curlevel][7]);
		if (s_sev) {
			s_text[curlevel] = s_sev + ' spinal canal stenosis';
		}
		
		
		// OTHER COLUMN //
		other = [];
		other = $(others[curlevel]).multipleSelect("getSelects", "text");
		for (i = 0; i < other.length; i++) {			// for all checked boxes in the multipleSelect
			other[i] = other[i].replace(/(\[|\])/g, '');		// remove []
			other[i] = other[i].replace(/(.+): (.+)/, '$2 $1');	// 'dd: mild' → 'mild dd'
			other[i] = other[i].replace(/,  /, '-');			// 'mild,  mod dd' → 'mild-mod dd'
			other[i] = other[i].replace(/mod/, 'moderate');		// 'mod' → 'moderate'
			other[i] = other[i].replace(/sev/, 'severe');		// 'sev' → 'severe'
		}
		
		// consolidate "other" findings into a comma-separated phrase
		switch (other.length) {
			case 0:
				o_text[curlevel] = '';
				break;
			case 1:
				o_text[curlevel] = '. ' + other;
				break;
			default:
				o_text[curlevel] = '. ' + other.join('. ');
		}
		
		// X R FJH + X L FJH → X B FJH
		o_text[curlevel] = o_text[curlevel].replace(/facet joint hypertrophy, (\w+)\b/ig, '$1 facet joint hypertrophy');
		o_text[curlevel] = o_text[curlevel].replace(/\b(\w+) right.*\1 left/i, '$1 bilateral');
		o_text[curlevel] = o_text[curlevel].replace(/\. right facet joint hypertrophy. Left/i, '. Bilateral');
		o_text[curlevel] = o_text[curlevel].replace(/ facet joint hypertrophy. (.*) facet/, ' and $1 facet');
		o_text[curlevel] = o_text[curlevel].replace(/\. right and (.*) left facet/i, '. $1 bilateral facet');
		o_text[curlevel] = o_text[curlevel].replace(/right and left /i, 'bilateral ');
		
	} // END OF CYCLE THROUGH DISC LEVELS
	
	
	// ===== CONCLUSION SENTENCE ===== //
	if (!document.getElementById('conclusion').checked) {
		concl = '';	// blank conclusion sentence if checkbox is unchecked
	} else {
		var refsevs = "mild mild-moderate moderate moderate-severe severe".split(' ');
		var lumbarlevels = " L1-2 L2-3 L3-4 L4-5 L5-S1".split(' ');
		var n_sevs = [], s_sevs = [], concl = '', high_sev, high_sev_level = [], cl, s_match = false;
		
		// get a list of SS + NFN severities, removing clone c*
		for(i = 1; i <= 5; i++) {
			s_sevs[i] = getContent(levels[i][7]).replace(/c[0-9]/g, '');
			n_sevs[i] = getContent(levels[i][0]).replace(/c[0-9]/g, '');
			n_sevs[i + 5] = getContent(levels[i][6]).replace(/c[0-9]/g, '');
		}
		
		// priority: 1) highest severity. 2) favor SS over NF when enumerating levels
		for(i = 4; i >= 0; i--) {					// iterate backwards from most severe
			if (s_sevs.indexOf(refsevs[i]) > -1) {	// if there is an SS match ...
				for(cl = 1; cl <= 5; cl++) {		// ... look through all levels ...
					if (getContent(levels[cl][7]).replace(/c[0-9]/g, '') === refsevs[i]) {	// ... if there are other levels with equivalent SS severities
						high_sev_level[high_sev_level.length] = lumbarlevels[cl];	// ... store them too
					}
				}
				high_sev = refsevs[i];
				i = -1;	// exit loop. if there is a match, don't look for lower severity matches
				s_match = true;
			}
			
			if (n_sevs.indexOf(refsevs[i]) > -1 && !s_match) {	// if there is an NFN match but no SS match...
				for(cl = 1; cl <= 5; cl++) {		// ... look through all levels ...
					if (getContent(levels[cl][0]).replace(/c[0-9]/g, '') === refsevs[i] || getContent(levels[cl][6]).replace(/c[0-9]/g, '') === refsevs[i]) {	// ... if there are other levels with equivalent NFN severities
						high_sev_level[high_sev_level.length] = lumbarlevels[cl];	// ... store them too
					}
				}
				high_sev = refsevs[i];
				i = -1;	// exit loop. if there is a match, don't look for lower severity matches
			}			
			
		}

		// list the levels where highest severity is present
		if (high_sev) {
			switch(high_sev_level.length) {
				case 1:
					concl = high_sev_level + ' level.';	// maybe this converts it to a string
					break;
				case 2:
					concl = high_sev_level.join(' and ') + ' levels.';
					break;
				default:
					concl = high_sev_level.join(', ') + ' levels.';
			}
			
			concl = concl.replace(/-(\d).*\1/g,'');	// combine Lx-y and Ly-z → Lx-z
			
			// generate conclusion sentence
			concl =
				capitalizer(high_sev) + 
				(
					high_sev_level.length < 3 ?
						' lumbar spondylosis, particularly at the ' +
						concl.replace(/,(?=[^,]*$)/, ', and')
					:
						' multi-level lumbar spondylosis as described above.'
				) +
				'<br><br>'			
				;
				
		} else {
			concl = 'No significant degenerative change.<br><br>';
		}
		concl = '<b>CONCLUSION:</b><br>' + concl;			
		
	}
	
	
	// ===== GENERATE SENTENCE FOR EACH LEVEL ===== //
	for (i = 1; i <= 5; i++) {
		// add 'and' and oxford commas
		h_text[i] = h_text[i].replace(/,(?=[^,]*$)/, ', and');
		
		// combine sentences
		levels_text[i] = h_text[i] + '. ' + n_text[i] + '. ' + s_text[i] + o_text[i] + '.';

		// remove clones' 'c#'
		levels_text[i] = levels_text[i].replace(/c[0-9]/g, '');

		// toLowerCase() first to include editable DIV, then apply sentence case
		levels_text[i] = capitalizer(levels_text[i].toLowerCase());

        // fix for listheses
        levels_text[i] = levels_text[i].replace(/(i+-?i*) (\w+listhesis)/ig, 'Grade $1 $2');
        levels_text[i] = levels_text[i].replace(/ (i+-?i*) /ig, String.call.bind(levels_text[1].toUpperCase));
        
		// convert first letter to lowercase because text starts with "There "
		levels_text[i] = levels_text[i].substring(0,1).toLowerCase() + levels_text[i].substring(1);
	}
	
	
	// ===== ADD TALKSTATION [BRACKETS] ===== //
	if (document.getElementById('talk-brackets').checked) {	// make sure checkbox is checked
		for (i = 1; i <= 5; i++) {
			// add [brackets] to main report for easier editing in Talk
			levels_text[i] = levels_text[i].replace(/(mild|moderate|severe|minimal|no disc bulge or protrusion.|No neuroforaminal narrowing\.|No spinal canal stenosis\.)/ig, '[$1]');
			levels_text[i] = levels_text[i].replace(/(\[mild\]-\[moderate\]|\[moderate\]-\[severe\]|\[mild\]-\[severe\])/ig, '[$1]');
		}
		
		// add [brackets] to conclusion sentence for easier editing in Talk
		if (concl) {
			concl = concl.replace(/b><br>(.*\.)<br>/igm, 'b><br> [$1]<br>');
		}
	}
	
	
	// ===== GENERATE REPORT ====== //
	report_text =	'<b>L1-L2</b>: There ' + levels_text[1] + '<br>' + 
					'<b>L2-L3</b>: There ' + levels_text[2] + '<br>' + 
					'<b>L3-L4</b>: There ' + levels_text[3] + '<br>' + 
					'<b>L4-L5</b>: There ' + levels_text[4] + '<br>' + 
					'<b>L5-S1</b>: There ' + levels_text[5] + 
					'<br><br>' +
					concl;

					
	// ===== UPDATE REPORT PREVIEW ===== //
	document.getElementById('report_textarea').innerHTML = report_text;
	
	
	return false;
};



// ===== SELECT ALL BUTTON ===== //
report_selectAll = function() {
	document.getElementById('report_textarea').focus();
	document.execCommand('SelectAll');
};



// ===== RESET BUTTON ===== //
report_reset = function() {
	var i, j, 
	table = 
		[
		'b1 r10 r11 r12 r13 r14 r15 r16 r17 #o1'.split(' '),	// L1-2
		'b2 r20 r21 r22 r23 r24 r25 r26 r27 #o2'.split(' '),	// L2-3
		'b3 r30 r31 r32 r33 r34 r35 r36 r37 #o3'.split(' '),	// L3-4
		'b4 r40 r41 r42 r43 r44 r45 r46 r47 #o4'.split(' '),	// L4-5
		'b5 r50 r51 r52 r53 r54 r55 r56 r57 #o5'.split(' ')		// L5-S1
		];
	
	for (i = 0; i < 5; i++) {
		for (j = 0; j < 9; j++) {
			REDIPS.drag.emptyCell(eval(table[i][j]));	// clear main table
		}
		$(table[i][9]).multipleSelect('uncheckAll');	// clear multipleSelects
	}
	
	report_update();
};



// ===== CAPITALIZE FIRST LETTER OF SENTENCE ===== //
function capitalizer(myString) {
	return myString.replace(/(^\w{1}|\.\s*\w{1})/gi, function(toReplace) {
		return toReplace.toUpperCase();
	});
}
