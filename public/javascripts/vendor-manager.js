var table;
var vendorId;
$(document).ready(function(){
  $('#submit-button').on('click', function() {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    var categoryText = $('#category-text').val();
    var noteText = $('#note-text').val();
    var nameText = $('#name-text').val();
    var phoneNumber = $('#phone-text').val();
    var emailAddress = $('#email-text').val();

    if(nameText) {
      if(vendorId) {
        $.ajax({
          url:"/vendors/"+vendorId,
          type: "PUT",
          data: JSON.stringify({
                  note: noteText,
                  category: categoryText,
                  name: nameText,
                  phone: phoneNumber,
                  email: emailAddress
               }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              $('#category-text').val('');
              $('#note-text').val('');
              $('#name-text').val('');
              $('#phone-text').val('');
              $('#email-text').val('');
              vendorId = null;
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
          url:"/vendors/",
          type: "POST",
          data: JSON.stringify({
                  note: noteText,
                  category: categoryText,
                  name: nameText,
                  phone: phoneNumber,
                  email: emailAddress
               }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/vendors").load();
              $('#category-text').val('');
              $('#note-text').val('');
              $('#name-text').val('');
              $('#phone-text').val('');
              $('#email-text').val('');
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
      alert('Vendor Name is required!')
    }
  });

  table = $('#vendors').dataTable({
            "ajax": "/vendors",
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
                { data: 'name', className: 'dt-body-center' },
                { data: 'phone',
                  className: 'dt-body-center',
                  render: function (phone) {
                            return '<a href="tel:' + phone + '">' + phone + '</a>';
                          }
                },
                { data: 'email',
                  width : '10%',
                  className: 'dt-body-center',
                  render: function (email) {
                            return '<a href="mailto:' + email + '">' + email + '</a>';
                          }
                },
                { data: 'category', className: 'dt-body-center' },
                { data: 'note', className: 'dt-body-center' }
            ],
            "order": [[ 2, "asc" ]],
            "processing": true,
            //"serverSide": true,
            "paging": true,
            "searching": true,
            "pagingType": "full_numbers",
            "scrollX": true
        }
  );

  // Handle click on checkbox
  $('#vendors tbody').on('click', 'input[type="checkbox"]', function(e){
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
  $('#vendors').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#vendors tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#vendors tbody input[type="checkbox"]:checked').trigger('click');
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
        url:"/vendors/"+value['id'],
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
    $.get("/vendors/"+rows_selected[0]['id'], function(data, status){
      if("success" === status) {
        $('#category-text').val(data['category']);
        $('#note-text').val(data['note']);
        $('#name-text').val(data['name']);
        $('#phone-text').val(data['phone']);
        $('#email-text').val(data['email']);
        vendorId = rows_selected[0]['id'];
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
