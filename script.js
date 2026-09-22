var fullImgBox = document.getElementById("fullImgBox");
var fullImg = document.getElementById("fullImg");
var gallery = document.querySelector(".img-gallery");
var galleryImages = Array.from(document.querySelectorAll(".img-gallery img"));
var closeButton = document.getElementById("closeButton");
var previousButton = document.getElementById("previousButton");
var nextButton = document.getElementById("nextButton");
var downloadButton = document.getElementById("downloadButton");
var editButton = document.getElementById("editButton");
var deleteButton = document.getElementById("deleteButton");
var previewCounter = document.getElementById("previewCounter");
var previewTitle = document.getElementById("previewTitle");
var previewDescription = document.getElementById("previewDescription");
var imageUpload = document.getElementById("imageUpload");
var imageCount = document.querySelector(".image-count");
var searchInput = document.getElementById("searchInput");
var allFilter = document.getElementById("allFilter");
var favoriteFilter = document.getElementById("favoriteFilter");
var themeToggle = document.getElementById("themeToggle");
var dropZone = document.getElementById("dropZone");
var currentImage = null;
var favoriteImages = JSON.parse(localStorage.getItem("favoriteImages") || "[]");
var currentFilter = "all";
var currentSearch = "";

var imageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            imageObserver.unobserve(entry.target);
        }
    });
});

function getGalleryItem(image) {
    return image.closest(".gallery-item");
}

function getFavoriteKey(image) {
    return image.dataset.favoriteKey || image.src;
}

function getVisibleImages() {
    return galleryImages.filter(function (image) {
        return !getGalleryItem(image).classList.contains("is-hidden");
    });
}

function openFullImg(image) {
    var visibleImages = getVisibleImages();
    currentImage = image;
    showImage(visibleImages.indexOf(image));
    fullImgBox.classList.add("open");
    fullImgBox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
}

function closeFullImg() {
    fullImgBox.classList.remove("open");
    fullImgBox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
}

function showImage(index) {
    var visibleImages = getVisibleImages();

    if (!visibleImages.length) {
        closeFullImg();
        return;
    }

    var safeIndex = (index + visibleImages.length) % visibleImages.length;
    currentImage = visibleImages[safeIndex];
    var galleryItem = getGalleryItem(currentImage);
    fullImg.src = currentImage.src;
    fullImg.alt = currentImage.alt;
    previewTitle.textContent = galleryItem.dataset.title;
    previewDescription.textContent = galleryItem.dataset.description;
    previewCounter.textContent = (safeIndex + 1) + " / " + visibleImages.length;
    deleteButton.hidden = galleryItem.dataset.uploaded !== "true";
}

function showNextImage() {
    var visibleImages = getVisibleImages();
    showImage(visibleImages.indexOf(currentImage) + 1);
}

function showPreviousImage() {
    var visibleImages = getVisibleImages();
    showImage(visibleImages.indexOf(currentImage) - 1);
}

function saveFavorites() {
    localStorage.setItem("favoriteImages", JSON.stringify(favoriteImages));
}

function updateFavoriteButton(image, favoriteButton) {
    var isFavorite = favoriteImages.includes(getFavoriteKey(image));
    favoriteButton.classList.toggle("is-favorite", isFavorite);
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.setAttribute("aria-label", isFavorite ? "Remove from favourites" : "Add to favourites");
    favoriteButton.textContent = isFavorite ? "♥" : "♡";
}

function toggleFavorite(image, favoriteButton) {
    var favoriteKey = getFavoriteKey(image);
    var favoriteIndex = favoriteImages.indexOf(favoriteKey);

    if (favoriteIndex === -1) {
        favoriteImages.push(favoriteKey);
    } else {
        favoriteImages.splice(favoriteIndex, 1);
    }

    saveFavorites();
    updateFavoriteButton(image, favoriteButton);
    filterGallery();
}

function updateCaption(galleryItem) {
    var caption = galleryItem.querySelector(".image-caption");

    if (!caption) {
        caption = document.createElement("figcaption");
        caption.className = "image-caption";
        galleryItem.appendChild(caption);
    }

    caption.innerHTML = "<strong>" + galleryItem.dataset.title + "</strong><span>" + galleryItem.dataset.description + "</span>";
}

function setupGalleryItem(galleryItem) {
    var image = galleryItem.querySelector("img");
    var favoriteButton = document.createElement("button");

    favoriteButton.className = "favorite-button";
    favoriteButton.type = "button";
    updateCaption(galleryItem);
    galleryItem.appendChild(favoriteButton);
    updateFavoriteButton(image, favoriteButton);
    favoriteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleFavorite(image, favoriteButton);
    });
    image.addEventListener("click", function () {
        openFullImg(image);
    });
    imageObserver.observe(image);
}

function addImages(files) {
    Array.from(files).filter(function (file) {
        return file.type.startsWith("image/");
    }).forEach(addImageToGallery);
    imageUpload.value = "";
}

function addImageToGallery(file) {
    var imageUrl = URL.createObjectURL(file);
    var galleryItem = document.createElement("figure");
    var image = document.createElement("img");

    galleryItem.className = "gallery-item";
    galleryItem.dataset.title = file.name;
    galleryItem.dataset.description = "Added from your device.";
    galleryItem.dataset.uploaded = "true";
    image.alt = file.name;
    image.src = imageUrl;
    image.dataset.favoriteKey = imageUrl;
    galleryItem.appendChild(image);
    gallery.appendChild(galleryItem);
    galleryImages.push(image);
    setupGalleryItem(galleryItem);
    updateImageCount();
    filterGallery();
}

function updateImageCount() {
    imageCount.textContent = getVisibleImages().length + " / " + galleryImages.length + " images";
}

function filterGallery() {
    var searchTerm = currentSearch.toLowerCase();

    galleryImages.forEach(function (image) {
        var galleryItem = getGalleryItem(image);
        var searchableText = (galleryItem.dataset.title + " " + galleryItem.dataset.description).toLowerCase();
        var matchesSearch = searchableText.includes(searchTerm);
        var matchesFavorite = currentFilter === "all" || favoriteImages.includes(getFavoriteKey(image));
        galleryItem.classList.toggle("is-hidden", !matchesSearch || !matchesFavorite);
    });

    updateImageCount();
    allFilter.classList.toggle("active", currentFilter === "all");
    favoriteFilter.classList.toggle("active", currentFilter === "favourites");
}

function downloadCurrentImage() {
    var downloadLink = document.createElement("a");
    downloadLink.href = currentImage.src;
    downloadLink.download = getGalleryItem(currentImage).dataset.title || "gallery-image";
    downloadLink.click();
}

function editCurrentImage() {
    var galleryItem = getGalleryItem(currentImage);
    var newTitle = prompt("Image name", galleryItem.dataset.title);
    var newDescription;

    if (newTitle === null) {
        return;
    }

    newDescription = prompt("Image description", galleryItem.dataset.description);
    if (newDescription === null) {
        return;
    }

    galleryItem.dataset.title = newTitle.trim() || "Untitled image";
    galleryItem.dataset.description = newDescription.trim() || "No description yet.";
    currentImage.alt = galleryItem.dataset.title;
    updateCaption(galleryItem);
    showImage(getVisibleImages().indexOf(currentImage));
    filterGallery();
}

function deleteCurrentImage() {
    var galleryItem = getGalleryItem(currentImage);

    if (galleryItem.dataset.uploaded !== "true" || !confirm("Delete this uploaded image?")) {
        return;
    }

    URL.revokeObjectURL(currentImage.src);
    galleryItem.remove();
    galleryImages = galleryImages.filter(function (image) {
        return image !== currentImage;
    });
    filterGallery();
    closeFullImg();
}

function setTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    localStorage.setItem("darkMode", String(isDark));
}

Array.from(document.querySelectorAll(".gallery-item")).forEach(setupGalleryItem);
filterGallery();
setTheme(localStorage.getItem("darkMode") === "true");

imageUpload.addEventListener("change", function () {
    addImages(imageUpload.files);
});

searchInput.addEventListener("input", function () {
    currentSearch = searchInput.value;
    filterGallery();
});

allFilter.addEventListener("click", function () {
    currentFilter = "all";
    filterGallery();
});

favoriteFilter.addEventListener("click", function () {
    currentFilter = "favourites";
    filterGallery();
});

themeToggle.addEventListener("click", function () {
    setTheme(!document.body.classList.contains("dark-mode"));
});

["dragenter", "dragover"].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropZone.classList.add("is-dragging");
    });
});

["dragleave", "drop"].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropZone.classList.remove("is-dragging");
    });
});

dropZone.addEventListener("drop", function (event) {
    addImages(event.dataTransfer.files);
});

closeButton.addEventListener("click", closeFullImg);
nextButton.addEventListener("click", showNextImage);
previousButton.addEventListener("click", showPreviousImage);
downloadButton.addEventListener("click", downloadCurrentImage);
editButton.addEventListener("click", editCurrentImage);
deleteButton.addEventListener("click", deleteCurrentImage);

fullImgBox.addEventListener("click", function (event) {
    if (event.target === fullImgBox) {
        closeFullImg();
    }
});

document.addEventListener("keydown", function (event) {
    if (!fullImgBox.classList.contains("open")) {
        return;
    }

    if (event.key === "Escape") {
        closeFullImg();
    } else if (event.key === "ArrowRight") {
        showNextImage();
    } else if (event.key === "ArrowLeft") {
        showPreviousImage();
    }
});
