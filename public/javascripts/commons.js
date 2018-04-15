var currentDate = new Date();
var twoWeekBefore = new Date();
twoWeekBefore.setDate(currentDate.getDate() - 14);
var rows_selected = [];
function updateDataTableSelectAllCtrl(table){
   var $table             = table.api().table().node();
   var $chkbox_all        = $('tbody input[type="checkbox"]', $table);
   var $chkbox_checked    = $('tbody input[type="checkbox"]:checked', $table);
   var chkbox_select_all  = $('thead input[name="select_all"]', $table).get(0);

   // If none of the checkboxes are checked
   if($chkbox_checked.length === 0){
      chkbox_select_all.checked = false;
      if('indeterminate' in chkbox_select_all){
         chkbox_select_all.indeterminate = false;
      }

   // If all of the checkboxes are checked
   } else if ($chkbox_checked.length === $chkbox_all.length){
      chkbox_select_all.checked = true;
      if('indeterminate' in chkbox_select_all){
         chkbox_select_all.indeterminate = false;
      }

   // If some of the checkboxes are checked
   } else {
      chkbox_select_all.checked = true;
      if('indeterminate' in chkbox_select_all){
         chkbox_select_all.indeterminate = true;
      }
   }
}

function refreshTable(table, after_deleted = false) {
	var ajax_url = table.api().ajax.url();
	if(ajax_url.indexOf("startDate") >= 0) {
		table.api().clear();
		table.api().ajax.reload();
	} else {
		var page_num = table.api().page.info().page;
		if(after_deleted) {
			table.api().clear();
			table.api().ajax.reload();
		} else {
			table.api().ajax.reload(null, false);
		}
		table.api().search( $('div.dataTables_filter input').val() ).draw();
		table.api().page( page_num ).draw(false);
	}
	rows_selected = [];
}

function datePickerSetup() {
    $('#startDatePicker' ).datepicker({
        onSelect: function (date, instance) {
        }
    });
    $('#startDatePicker' ).datepicker("setDate" , ( twoWeekBefore.getMonth() + 1 ) + "/" + twoWeekBefore.getDate() + "/" + twoWeekBefore.getFullYear());
    $('#endDatePicker').datepicker({
        onSelect: function(date, instance) {
        }
    });
    $('#endDatePicker').datepicker("setDate", ( currentDate.getMonth() + 1 ) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear());
}

function resultPopup(response) {
	var popup_title = 'FAIL';
	if(response != null && response.responseJSON != null && response.responseJSON.success === true) {
		popup_title = 'SUCCESS';
	}
	if(response.responseText.indexOf("<html>")>-1) {
		var win = window.open();
		win.document.write(response.responseText);
	} else {
		$('<div></div>').appendTo('body')
			.html('<div>'+ response.responseText + '</div>')
			.dialog({
				modal: true,
				title: popup_title,
				zIndex: 10000,
				autoOpen: true,
				width: 'auto',
				resizable: false,
				buttons: {
					'OK': function () {
						$(this).dialog("close");
						if(window.location.pathname.indexOf("job_view") >= 0) {
							refreshTable(table);
						}
					}
				},
				close: function () {
					$(this).remove();
					if(window.location.pathname.indexOf("job_view") >= 0) {
						refreshTable(table);
					}
				}
		});
	}
}
