var table;
var payTime;
var expenseId;
$(document).ready(function(){
  $('#property-select').find('option').remove();
  $('#unit-select').find('option').remove();
  $('#type-select').find('option').remove();
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

  $.get("/expense-types", function(data, status){
    console.log(data['data']);
    $('#type-select').append('<option>Select Expense Type</option>');
    $.each(data['data'], function(key, value){
      console.log(value);
      console.log(value['id']);
      console.log(value['name']);
      $('#type-select').append('<option value=' + value['id'] + '>' + value['name'] + '</option>');
    });
    if(data['data'].length > 0) {
      $('#type-select option:first').attr("selected",true);
    }
  });

  $('#property-select').on('change', function() {
    $('#unit-select').find('option').remove();
    $('#unit-select').append('<option>Select Unit</option>');
    $.get("/properties/" + $(this).val() + "/units", function(data, status){
      console.log(data['data']);
      $.each(data['data'], function(key, value){
        console.log(value);
        console.log(value['id']);
        console.log(value['name']);
        $('#unit-select').append('<option value=' + value['id'] + '>' + value['name'] + '</option>');
      });
      if(data['data'].length === 0) {
        $('#unit-select').val($('#unit-select option:first').val()).change();
      }
    });
  });

  $('#submit-button').on('click', function() {
    var unitId = $('#unit-select').val();
    var typeId = $('#type-select').val();
    var payAmount = $('#pay-amount-text').val();
    var payTo = $('#pay-to-text').val();
    var payDesc = $('#pay-desc-text').val();
    console.log(unitId);
    console.log(payAmount);
    console.log(payTo);
    console.log(payDesc);
    if( unitId && typeId && payAmount ) {
      if(expenseId) {
        $.ajax({
          url:"/expenses/"+expenseId,
          type: "PUT",
          data: JSON.stringify({unit_id: unitId, pay_to: payTo, description: payDesc, type_id: typeId, amount: payAmount, pay_time: payTime}),
          contentType: "application/json; charset=utf-8",
          // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
          dataType: "json",
          statusCode: {
            200: function() {
              $('#unit-select option:selected').prop('selected', false).change();
              $('#type-select option:selected').prop('selected', false).change();
              $('#pay-amount-text').val("");
              $('#pay-to-text').val("");
              $('#pay-desc-text').val("");
              expenseId = null;
              payTime = null;
              refreshTable(table, false);
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
        $.post("/expenses", {unit_id: unitId, pay_to: payTo, description: payDesc, type_id: typeId, amount: payAmount})
         .done(function(data) {
            console.log(data);
            table.api().ajax.url("/expenses").load();
            $('#unit-select option:selected').prop('selected', false).change();
            $('#type-select option:selected').prop('selected', false).change();
            $('#property-select option:selected').prop('selected', false).change();
            $('#pay-amount-text').val("");
            $('#pay-to-text').val("");
            $('#pay-desc-text').val("");
            $("html, body").animate({ scrollTop: $(document).height() }, "slow");
          });
      }
    } else {
      alert('Property Unit, Expense Type and Amount are required!')
    }
  });

  table = $('#expenses').dataTable({
            "ajax": "/expenses",
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
                { "data": "id", "width" : "8%", className: 'dt-body-center' },
                { "data": "address_street", "width" : "18%" },
                { "data": "name", className: 'dt-body-center' },
                { "data": "address_city", className: 'dt-body-center' },
                { "data": "pay_to", className: 'dt-body-center'},
                { "data": "description", "width" : "18%" },
                { "data": "pay_type", className: 'dt-body-center' },
                { "data": "amount", className: 'dt-body-right' },
                { "data": "pay_time", "width" : "15%", className: 'dt-body-center' }
            ],
            "order": [[ 1, "desc" ]],
            "processing": true,
            //"serverSide": true,
            "paging": true,
            "searching": true,
            "pagingType": "full_numbers"
        }
  );

  // Handle click on checkbox
  $('#expenses tbody').on('click', 'input[type="checkbox"]', function(e){
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
  $('#expenses').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#expenses tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#expenses tbody input[type="checkbox"]:checked').trigger('click');
    }

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle table draw event
  table.on('draw', function(){
    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);
  });
});

$(document).on('click', '#delete-button', function(){
  if(0 !== rows_selected.length) {
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/expenses/"+value['id'],
        type: "DELETE",
        // data: JSON.stringify({"ids": ids}),
        contentType: "application/json; charset=utf-8",
        // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
        dataType: "json",
        statusCode: {
          200: function() {
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
    $.get("/expenses/"+rows_selected[0]['id'], function(data, status){
      if("success" === status) {
        $.get("/units/"+data['unit_id'], function(udata, ustatus){
          if("success" === ustatus) {
            $('#property-select').val(udata['property_id']).change();
            $('#pay-amount-text').val(Number(data['amount'].replace("$", "")));
            $('#pay-to-text').val(data['pay_to']);
            $('#pay-desc-text').val(data['description']);
            $('#type-select').val(data['type_id']).change();
            payTime = data['pay_time'];
            expenseId = rows_selected[0]['id'];
            window.setTimeout(function(){
              console.log(">>>>>" + data['unit_id']);
              $('#unit-select').val(data['unit_id']).change();
            }, 500);
          }
        })
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
