var table;
var userId;
$(document).ready(function(){

  $('#submit-button').on('click', function() {
    var loginEmail = $('#email-text').val();
    var firstName = $('#firstname-text').val();
    var lastName = $('#lastname-text').val();
    var phoneNumber = $('#phone-text').val();
    var isManager = $('#is-manager-checkbox').prop('checked');

    if( !phoneNumber) {
      phoneNumber = '';
    }

    if( loginEmail && firstName ) {
      if(userId) {
        $.ajax({
          url:"/users/"+userId,
          type: "PUT",
          data: JSON.stringify({
                                  email: loginEmail,
                                  firstname: firstName,
                                  lastname: lastName,
                                  phone: '<a href="tel:' + phoneNumber + '">' + phoneNumber + '</a>',
                                  is_manager: isManager
                                }),
          contentType: "application/json; charset=utf-8",
          // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
          dataType: "json",
          statusCode: {
            200: function() {
              $('#email-text').val('');
              $('#firstname-text').val('');
              $('#lastname-text').val('');
              $('#phone-text').val('');
              if($('#is-manager-checkbox').prop('checked')) {
                $('#is-manager-checkbox').click();
              }
              userId = null;
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
        $.post("/users", {
                            email: loginEmail,
                            firstname: firstName,
                            lastname: lastName,
                            phone: '<a href="tel:' + phoneNumber + '">' + phoneNumber + '</a>',
                            is_manager: isManager
                          })
         .done(function(data) {
            console.log(data);
            table.api().ajax.url("/users").load();
            $('#email-text').val('');
            $('#firstname-text').val('');
            $('#lastname-text').val('');
            $('#phone-text').val('');
            if($('#is-manager-checkbox').prop('checked')) {
              $('#is-manager-checkbox').click();
            }
            $("html, body").animate({ scrollTop: $(document).height() }, "slow");
          });
      }
    } else {
      alert('Email and Firstname are required!')
    }
  });

  table = $('#users').dataTable({
            ajax: "/users",
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
                { "data": "email", className: 'dt-body-center' },
                { "data": "firstname", className: 'dt-body-center'},
                { "data": "lastname", className: 'dt-body-center'},
                { "data": "phone", className: 'dt-body-center'},
                { "data": "is_manager", className: 'dt-body-center', "width" : "10%" }
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
  $('#users tbody').on('click', 'input[type="checkbox"]', function(e){
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
  $('#users').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#users tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#users tbody input[type="checkbox"]:checked').trigger('click');
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
        url:"/users/"+value['id'],
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
    $.get("/users/"+rows_selected[0]['id'], function(data, status){
      if("success" === status) {
        var phone = data['phone'];
        $('#email-text').val(data['email']);
        $('#firstname-text').val(data['firstname']);
        $('#lastname-text').val(data['lastname']);
        if(phone) {
          $('#phone-text').val(phone.substring(phone.indexOf(">")+1,phone.lastIndexOf("<")));
        }
        if($('#is-manager-checkbox').prop('checked') != data['is_manager']) {
          $('#is-manager-checkbox').click();
        }
        userId = rows_selected[0]['id'];
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
