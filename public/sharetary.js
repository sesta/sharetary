function formattedDatetime(date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2) + ' ' +
           ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ':' + ('0' + date.getSeconds()).substr(-2);
}

function scrollToTarget(id) {
  var item = document.getElementById(id);
  if (item)
    $('html, body').animate({ scrollTop: $(item).offset().top }, 'normal');
}

function scrollToEvent(link) {
  var id = link.href.split('#')[1];
  if (id)
    scrollToTarget(id);
}


function fillDatetimeFormatField(prefix) {
  var filterValue = $('#filter-' + prefix).val();
  if (filterValue) {
    var date = new Date(parseInt(filterValue) * 1000);
    $('#filter-' + prefix + '-format').val(
      ('000' + date.getFullYear()).substr(-4) +
      '-' +
      ('0' + (date.getMonth() + 1)).substr(-2) +
      '-' +
      ('0' + date.getDate()).substr(-2) +
      ' ' +
      ('0' + date.getHours()).substr(-2) +
      ':' +
      ('0' + date.getMinutes()).substr(-2) +
      ':' +
      ('0' + date.getSeconds()).substr(-2)
    );
  }
  else {
    $('#filter-' + prefix + '-format').val('');
  }
}

function updateFilterFromFields(prefix) {
    var formatDatetime = $('#filter-' + prefix + '-format').val();
    var parsed = formatDatetime.match(/^\s*(\d+)-(\d+)-(\d+)(?:\s*(\d+):(\d+):(\d+))?/);
    if (parsed) {
      var year   = parseInt(parsed[1] || '0');
      var month  = parseInt(parsed[2] || '1') - 1;
      var date   = parseInt(parsed[3] || '1');
      var hour   = parseInt(parsed[4] || '0');
      var minute = parseInt(parsed[5] || '0');
      var second = parseInt(parsed[6] || '0');
      var filter = new Date();
      filter.setFullYear(year, month, date);
      filter.setHours(hour, minute, second, 0);
      var unixtime = Math.floor(filter.getTime() / 1000);
      $('#filter-' + prefix).val(unixtime);
    }
    else {
      $('#filter-' + prefix).val('');
    }
}

function initDateTimePicker(prefix) {
  var unixtime = parseInt($('#filter-' + prefix).val());
  var defaultDate = null;
  if (!isNaN(unixtime))
    defaultDate = new Date(unixtime * 1000);

  var picker = $('#datetimepicker-' + prefix);
  picker.datetimepicker({
    format:      'YYYY-MM-DD HH:mm:ss',
    sideBySide:  true,
    showClear:   true,
    focusOnShow: true,
    useCurrent:  false,
    defaultDate: defaultDate
  });

  fillDatetimeFormatField(prefix);

  var field = $('#filter-' + prefix + '-format');
  field.data('old-value', field.val());
  picker.bind('dp.change', function(event) {
    if (field.data('old-value') != field.val())
      updateFilterFromFields(prefix);
  });
  field.bind('propertychange change click keyup input paste', function(event) {
    if (field.data('old-value') != field.val())
      updateFilterFromFields(prefix);
  });
}

function getValues(selector) {
  var actors = ($(selector).prop('value') || '').trim();
  return actors ? actors.split(/\s*,\s*/) : [] ;
}

initActorsFilters.fired = false;
function initActorsFilters() {
  if (initActorsFilters.fired)
    return;

  initActorsFilters.fired = true;

  $.ajax({
    url: '/filters-actors?' + [
      'searchTerm=' + $('#filter-searchTerm').val(),
      'tags=' + $('#filter-tags').val(),
      'after=' + $('#filter-after').val(),
      'before=' + $('#filter-before').val()
    ].join('&')
  }).done(function(data) {
    var checkboxes = $(data);
    checkboxes.css({ height: 'hidden', opacity: 'hidden' });
    $('#filter-actors-fields').append(checkboxes);
    checkboxes.animate({ height: 'show', opacity: 'show' }, 'normal');
    var actors = getValues('#filter-actors');
    $('*[id^="filter-actors-item-"]').each(function() {
      var checkbox = $(this);
      var actor = checkbox.attr('data-actor');
      checkbox.prop('checked', actors.indexOf(actor) > -1);
      checkbox.bind('propertychange change click keyup', function(event) {
        var actors = getValues('#filter-actors').filter(function(oneActor) {
          return oneActor != actor;
        });
        if (checkbox.prop('checked'))
          actors.push(actor);
        $('#filter-actors').val(actors.join(','));
      });
    });
  });
}

initTagsFilters.fired = false;
function initTagsFilters() {
  if (initTagsFilters.fired)
    return;

  initTagsFilters.fired = true;

  $.ajax({
    url: '/filters-tags?' + [
      'searchTerm=' + $('#filter-searchTerm').val(),
      'actors=' + $('#filter-actors').val(),
      'after=' + $('#filter-after').val(),
      'before=' + $('#filter-before').val()
    ].join('&')
  }).done(function(data) {
    var checkboxes = $(data);
    checkboxes.css({ height: 'hidden', opacity: 'hidden' });
    $('#filter-tags-fields').append(checkboxes);
    checkboxes.animate({ height: 'show', opacity: 'show' }, 'normal');
    var tags = getValues('#filter-tags');
    $('*[id^="filter-tags-item-"]').each(function() {
      var checkbox = $(this);
      var tag = checkbox.attr('data-tag');
      checkbox.prop('checked', tags.indexOf(tag) > -1);
      checkbox.bind('propertychange change click keyup', function(event) {
        var tags = getValues('#filter-tags').filter(function(oneTag) {
          return oneTag != tag;
        });
        if (checkbox.prop('checked'))
          tags.push(tag);
        $('#filter-tags').val(tags.join(','));
      });
    });
  });
}

$(function() {
  $('#filter-actors-container').on('show.bs.collapse', initActorsFilters);
  $('#filter-tags-container').on('show.bs.collapse', initTagsFilters);
  $('#filters').on('show.bs.modal', function() {
    initDateTimePicker('after');
    initDateTimePicker('before');
  });

  var id = encodeURIComponent(location.hash.substr(1));
  if (id)
    scrollToTarget(id);
});
