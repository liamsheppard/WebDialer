
// Put the image on the canvas, clipping stuff that does not fit
function drawOnCanvas(canvas, img, mask) {
  // Check in which way we have to clip:
  var ctx = canvas.getContext("2d");
  var cx = canvas.width;
  var cy = canvas.height;
  if (cx * img.height < img.width * cy) {
    var scale = cy / img.height;
    var xs = img.width * scale;
    var ys = img.height * scale;
    var offset = (cx - xs) * 0.5;
    ctx.drawImage(img, offset, 0, xs, ys);
  }
  else {
    var scale = cx / img.width;
    var xs = img.width * scale;
    var ys = img.height * scale;
    var offset = (cy - ys) * 0.5;
    ctx.drawImage(img, 0, offset, xs, ys);
  }

  if (typeof mask === "string" && mask.length > 0) {
    // Apply special functions:
    var image = new Image();

    // When the image has loaded, draw it to the canvas
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
    }

    // Now set the source of the image that we want to load
    image.src = mask;
  }
}

var svgFileToSave = "";
function loadLogoDropbox(element, previews) {
  var dropbox = document.getElementById(element);

  // init event handlers
  function dragEnter(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this.style.backgroundColor = '#F0F0F0';
    return true;
  }
  function dragLeave(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this.style.backgroundColor = '#FEFFEC';
    return true;
  }
  function dragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
    return ok;
  }

  function dropImage(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    var dropbox = this;
    if (files.length > 0) {
      var reader = new FileReader();
      reader.onloadend = function (e) {
        var img = new Image();
        img.src = e.target.result;
        dropbox.available = true; // Remember that this one has been used
        for (var i in previews) {
          var canvas = document.getElementById(i);
          drawOnCanvas(canvas, img, previews[i]);
        };
      }
      reader.readAsDataURL(files[0]);

      var reader2 = new FileReader();
      reader2.onloadend = function (e) {
        svgFileToSave = e.target.result;
      }
      if (files[0].name.split(".")[1] === "svg")
        reader2.readAsText(files[0]);
    }
  }
  dropbox.addEventListener("dragenter", dragEnter.bind(dropbox), false);
  dropbox.addEventListener("dragleave", dragLeave.bind(dropbox), false);
  dropbox.addEventListener("dragover", dragOver.bind(dropbox), false);
  dropbox.addEventListener("drop", dropImage.bind(dropbox), false);
}

function loadCurrentImage(element, path) {
  var canvas = document.getElementById(element);
  var image = new Image();

  // When the image has loaded, draw it to the canvas
  image.onload = function () {
    drawOnCanvas(canvas, image);
  }
  image.onerror = function () {
    // Clear the image:
    canvas.width = canvas.width;
  }

  // Now set the source of the image that we want to load
  image.src = path;
}

function saveImage(box, cat, images,restpath) {
  if (document.getElementById(box).available) {
    var path = restpath + "/image/" + cat + "/";
    for (var i in images) {
      if (svgFileToSave) {
        putRestImage(path + i, "nothing:image/svg+xml;nothing, " + btoa(svgFileToSave));
        svgFileToSave = "";
      }
      else {
        putRestImage(path + i, document.getElementById(i).toDataURL(images[i], 0.9));
      }
    }
  }
}

function deleteImage(box, cat, images, restpath) {
  if (confirm("{lng *client_side_scripts.js#delete_selected_entry}")) {
    var path = restpath + "/image/" + cat + "/";
    for (var i in images) {
      deleteRest(path + i);
    }
  }
}
