var groupByTypeChart;
$(document).ready(function(){
  $.get("/expenses/types", function(data, status){
    var ctx = document.getElementById('chartByType').getContext('2d');
    var chartByType = new Chart(ctx,{
      type: 'doughnut',
      data: data,
      options: {
        title: {
           display: true,
           text: 'Expense By Type'
        }
      }
    });
  });

  $.get("/expenses/units", function(data, status){
    var ctx = document.getElementById('chartByUnit').getContext('2d');
    var chartByUnit = new Chart(ctx,{
      type: 'doughnut',
      data: data,
      options: {
        title: {
           display: true,
           text: 'Expense By Unit'
        }
      }
    });
  });

  $.get("/expenses/times", function(data, status){
    var ctx = document.getElementById('chartByTime').getContext('2d');
    var chartByTime = new Chart(ctx,{
      type: 'bar',
      data: data,
      options: {
        title: {
           display: true,
           text: 'Expense By Time'
        }
      }
    });
  });
});
