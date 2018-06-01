var table;
var workId;
$(document).ready(function(){
  $('#property-select').find('option').remove();
  $('#unit-select').find('option').remove();
  $.get("/properties", function(data, status){
    console.log(data['data']);
    $('#property-select').append('<option>Select Property</option>');
    $.each(data['data'], function(key, value){
      console.log(value);
      console.log(value['id']);
      console.log(value['address_street']);
      $('#property-select').append('<option value=' + value['id'] + '>'
                                  + value['address_street'] + ', '
                                  + value['address_city'] + ','
                                  + value['address_state']
                                  + value['address_zip']
                                  + '</option>');
    });
    if(data['data'].length > 0) {
      $('#property-select option:first').attr("selected",true);
    }
      //$('#property-select').val($('#property-select option:first').val());
  });

  $('#property-select').on('change', function() {
    $('#unit-select').find('option').remove();
    $('#unit-select').append('<option>Select Unit</option>');
    if($(this).val() !== 'Select Property') {
      $.get("/properties/" + $(this).val() + "/units", function(data, status){
        $.each(data['data'][0]['PropertyUnits'], function(key, value){
          $('#unit-select').append('<option value=' + value['id'] + '>' + value['name'] + '</option>');
        });
        if(data['data'] && data['data'].length === 0) {
          $('#unit-select').val($('#unit-select option:first').val()).change();
        }
      });
    }
  });

  $('#submit-button').on('click', function() {
    var unitId = $('#unit-select').val();
    var descriptionText = $('#description-text').val();
    var statusText = $('#status-select').val();
    var estimationAmount = $('#estimation-text').val();
    var name = $('#name-text').val();
    var phoneNumber = $('#phone-text').val();
    var emailAddress = $('#email-text').val();
    var startDate = $('#work-start-date').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    var endDate = $('#work-end-date').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    if( unitId && estimationAmount && descriptionText ) {
      if(workId) {
        $.ajax({
          url:"/works/"+workId,
          type: "PUT",
          data: JSON.stringify({
                  unit_id: unitId,
                  description: descriptionText,
                  status: statusText,
                  estimation: estimationAmount,
                  assignee_name: name,
                  assignee_phone: phoneNumber,
                  assignee_email: emailAddress,
                  start_date: startDate,
                  end_date: endDate
               }),
          contentType: "application/json; charset=utf-8",
          // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
          dataType: "json",
          statusCode: {
            200: function() {
              $('#property-select option:selected').prop('selected', false).change();
              $('#unit-select option:selected').prop('selected', false).change();
              $('#status-select option:selected').prop('selected', false).change();
              $('#description-text').val('');
              $('#estimation-text').val('');
              $('#name-text').val('');
              $('#phone-text').val('');
              $('#email-text').val('');
              $('#work-start-date').datepicker('setDate', null);
              $('#work-end-date').datepicker('setDate', null);
              workId = null;
              // refreshTable(table, false);
              rows_selected=[];
              table.api().clear();
              table.api().ajax.reload();
              $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            },
            400: function(response) {
              resultPopup(response);
            },
            401: function() {
              location.reload();
            },
            500: function(response) {
              resultPopup(response);
            }
          }
        });
      } else {
        $.post("/works", {
          unit_id: unitId,
          description: descriptionText,
          status: statusText,
          estimation: estimationAmount,
          assignee_name: name,
          assignee_phone: phoneNumber,
          assignee_email: emailAddress,
          start_date: startDate,
          end_date: endDate
         })
         .done(function(data) {
            table.api().ajax.url("/works").load();
            $('#property-select option:selected').prop('selected', false).change();
            $('#unit-select option:selected').prop('selected', false).change();
            $('#status-select option:selected').prop('selected', false).change();
            $('#description-text').val('');
            $('#estimation-text').val('');
            $('#name-text').val('');
            $('#phone-text').val('');
            $('#email-text').val('');
            $('#work-start-date').datepicker('setDate', null);
            $('#work-end-date').datepicker('setDate', null);
            $("html, body").animate({ scrollTop: $(document).height() }, "slow");
          });
      }
    } else {
      alert('Property Unit, Description and Estimation are required!')
    }
  });

  table = $('#works').dataTable({
            "ajax": "/works",
            "columns": [
                { data: null,
                  searchable: false,
                  orderable: false,
                  width: '4%',
                  className: 'dt-body-center',
                  render: function () {
                            return '<input type="checkbox">';
                          }
                },
                { data: 'id', width: '8%', className: 'dt-body-center' },
                { data: 'PropertyUnit',
                  width: '10%',
                  className: 'dt-body-center',
                  render: function (PropertyUnit) {
                            return PropertyUnit['Property']['address_street'] + ' ' + PropertyUnit['name'];
                          }
                 },
                { data: 'description', className: 'dt-body-center' },
                { data: 'status', className: 'dt-body-center' },
                { data: 'estimation', className: 'dt-body-center' },
                { data: 'scheduled_date', className: 'dt-body-center' },
                { data: 'start_date', className: 'dt-body-center' },
                { data: 'end_date', className: 'dt-body-center' },
                { data: 'assignee_name', className: 'dt-body-center' },
                { data: 'assignee_phone',
                  className: 'dt-body-center',
                  render: function (assignee_phone) {
                            return '<a href="tel:' + assignee_phone + '">' + assignee_phone + '</a>';
                          }
                },
                { data: 'assignee_email',
                  width : '10%',
                  className: 'dt-body-center',
                  render: function (assignee_email) {
                            return '<a href="mailto:' + assignee_email + '">' + assignee_email + '</a>';
                          }
                }
            ],
            "order": [[ 6, "desc" ]],
            "processing": true,
            //"serverSide": true,
            "paging": true,
            "searching": true,
            "pagingType": "full_numbers",
            "scrollX": true
        }
  );

  // Handle click on checkbox
  $('#works tbody').on('click', 'input[type="checkbox"]', function(e){
    var $row = $(this).closest('tr');
    // Get row data
    var data = table.api().row($row).data();
    // Determine whether row ID is in the list of selected row IDs
    var index = $.inArray(data, rows_selected);

    // If checkbox is checked and row ID is not in list of selected row IDs
    if(this.checked && index === -1){
      rows_selected.push(data);
    // Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
    } else if (!this.checked && index !== -1){
      rows_selected.splice(index, 1);
    }

    if(this.checked){
      $row.addClass('selected');
    } else {
      $row.removeClass('selected');
    }

    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle click on table cells with checkboxes
  $('#works').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#works tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#works tbody input[type="checkbox"]:checked').trigger('click');
    }

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle table draw event
  table.on('draw', function(){
    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);
  });

  $('#work-start-date' ).datepicker({
    onSelect: function (date, instance) {
    }
  });

  $('#work-end-date' ).datepicker({
    onSelect: function (date, instance) {
    }
  });
});

$(document).on('click', '#delete-button', function(){
  if(0 !== rows_selected.length) {
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/works/"+value['id'],
        type: "DELETE",
        // data: JSON.stringify({"ids": ids}),
        contentType: "application/json; charset=utf-8",
        // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
        dataType: "json",
        statusCode: {
          200: function() {
                rows_selected=[];
                refreshTable(table, true);
               },
          400: function(response) {
                resultPopup(response);
               },
          401: function() {
                location.reload();
               },
          500: function(response) {
                resultPopup(response);
               }
        }
      });
    });
  }
});

$(document).on('click', '#edit-button', function(){
  if(1 === rows_selected.length) {
    $.get("/works/"+rows_selected[0]['id'], function(data, status){
      if("success" === status) {
        $.get("/units/"+data['unit_id'], function(udata, ustatus){
          if("success" === ustatus) {
            $('#property-select').val(udata['property_id']).change();
            $('#status-select').val(data['status']).change();
            $('#description-text').val(data['description']);
            $('#estimation-text').val(data['estimation']);
            $('#name-text').val(data['assignee_name']);
            $('#phone-text').val(data['assignee_phone']);
            $('#email-text').val(data['assignee_email']);
            if(data['start_date']) {
              var startDate = data['start_date'].split('T')[0].split('-');
              $('#work-start-date').datepicker('setDate', new Date(startDate[0], startDate[1]-1, startDate[2]));
            }
            if(data['end_date']) {
              var endDate = data['end_date'].split('T')[0].split('-');
              $('#work-end-date').datepicker('setDate', new Date(endDate[0], endDate[1]-1, endDate[2]));
            }
            workId = rows_selected[0]['id'];
            window.setTimeout(function(){
              console.log(">>>>>" + data['unit_id']);
              $('#unit-select').val(data['unit_id']).change();
            }, 500);
          }
        });
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
