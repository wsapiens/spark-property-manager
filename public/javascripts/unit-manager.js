var table;
var unitId;
$(function(){
  feather.replace()
  $(".manager-content-header").click(function () {
    $header = $(this);
    //getting the next element
    $content = $header.next();
    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
    $content.slideToggle(500, function () {
      //execute this after slideToggle is done
      //change text of header based on visibility of content div
      const managerContentHeaderIcon = $('#manager-content-header-icon');
      if($content.is(":visible")) {
        managerContentHeaderIcon.html(feather.icons['minus-circle'].toSvg());
        // headerIcon.replaceWith(feather.icons['minus-circle'].toSvg());
      } else {
        managerContentHeaderIcon.html(feather.icons['plus-circle'].toSvg());
      }
    });
  });
  $('#nav-dashboard').removeClass('active');
  $('#nav-expense').removeClass('active');
  $('#nav-import').removeClass('active');
  $('#nav-work').removeClass('active');
  $('#nav-vendor').removeClass('active');
  $('#nav-tenant').removeClass('active');
  $('#nav-property').removeClass('active');
  $('#nav-unit').addClass('active');
  $('#nav-payment').removeClass('active');
  $('#nav-user').removeClass('active');

  $('#property-select').find('option').remove();
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

  $('#submit-button').on('click', function() {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    var propertyId = $('#property-select').val();
    var unitName = $('#unit-name-text').val();
    var isBuilding = $('#is-building-checkbox').prop('checked');
    console.log(propertyId);
    console.log(unitName);
    console.log(isBuilding);
    if( propertyId && unitName ) {
      if(unitId) {
        $.ajax({
          url:"/units/"+unitId,
          type: "PUT",
          data: JSON.stringify({
                  property_id: propertyId,
                  name: unitName,
                  is_building: isBuilding
                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/units").load();
              $('#property-select option:selected').prop('selected', false).change();
              $('#unit-name-text').val('');
              if($('#is-building-checkbox').prop('checked')) {
                $('#is-building-checkbox').click();
              }
              propertyId = null;
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
        $.ajax({
          url:"/units/",
          type: "POST",
          data: JSON.stringify({
                  property_id: propertyId,
                  name: unitName,
                  is_building: isBuilding
                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/units").load();
              $('#property-select option:selected').prop('selected', false).change();
              $('#unit-name-text').val('');
              if($('#is-building-checkbox').prop('checked')) {
                $('#is-building-checkbox').click();
              }
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
      }
    } else {
      alert('Property and Unit Name are required!');
    }
  });

  table = $('#units').dataTable({
            ajax: "/units",
            columns: [
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
                { "data": "address_street", className: 'dt-body-center' },
                { "data": "name", className: 'dt-body-center'},
                { "data": "is_building", className: 'dt-body-center', "width" : "10%" }
            ],
            order: [[ 1, "desc" ]],
            processing: true,
            //"serverSide": true,
            paging: true,
            searching: true,
            pagingType: "full_numbers",
            scrollX: true,
            select: {
              style:    'os',
              selector: 'td:first-child'
            }
        }
  );

  // Handle click on checkbox
  $('#units tbody').on('click', 'input[type="checkbox"]', function(e){
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
  $('#units').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#units tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#units tbody input[type="checkbox"]:checked').trigger('click');
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
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/units/"+value.id,
        type: "DELETE",
        // data: JSON.stringify({"ids": ids}),
        contentType: "application/json; charset=utf-8",
        headers: { "CSRF-Token": token },
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
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    $.get("/units/"+rows_selected[0].id, function(data, status){
      if("success" === status) {
        $('#property-select').val(data.property_id).change();
        $('#unit-name-text').val(data.name);
        if($('#is-building-checkbox').prop('checked') != data.is_building) {
          $('#is-building-checkbox').click();
        }
        unitId = rows_selected[0].id;
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
