const infoImages = [
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0004.9ddlwwhz7x.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0003.8dxijpxiyf.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0002.5c1mihw6q3.jpg"
];

const infoImage = document.querySelector("[data-info-image]");

if (infoImage) {
  const randomImage = infoImages[Math.floor(Math.random() * infoImages.length)];
  infoImage.src = randomImage;
}
