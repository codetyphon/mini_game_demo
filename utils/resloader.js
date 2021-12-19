const load = (image_id_array, canvas, callback, on_progress) => {
  const loaded_images = [];
  image_id_array.forEach(element => {
    const img = canvas.createImage();
    img.src = `../../assets/${element}.png`
    img.onload = () => {
      console.log('load')
      loaded_images.push({
        id: element,
        img: img
      });
    }
  });

  const t = setInterval(() => {
    if (on_progress) {
      const progress = parseFloat((loaded_images.length / image_id_array.length).toFixed(2))
      on_progress(progress)
    }
    if (loaded_images.length === image_id_array.length) {
      callback(loaded_images)
      clearInterval(t)
    }
  }, 500)
}
module.exports = {
  load
}