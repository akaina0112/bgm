document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const metadataForm = document.getElementById('metadataForm');
  const titleInput = document.getElementById('title');
  const artistInput = document.getElementById('artist');
  const albumArtInput = document.getElementById('albumArt');
  const albumArtPreview = document.getElementById('albumArtPreview');
  const updateMetadataButton = document.getElementById('updateMetadata');
  const downloadLink = document.getElementById('downloadLink');
  const downloadButton = document.getElementById('downloadButton');

  let audioBuffer = null;
  let albumArtBlob = null;
  let uploadedFile = null;

  if (!albumArtInput) {
    console.error('albumArtInputが見つかりません');
    return;
  }

  // アルバムアートのプレビューを表示する
  albumArtInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        albumArtPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
      albumArtBlob = file;
    }
  });
  uploadForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const file = fileInput.files[0];
    uploadedFile = file; // アップロードされたファイルを保持する

    const reader = new FileReader();
    reader.onload = function(event) {
      const arrayBuffer = event.target.result;
      audioContext.decodeAudioData(arrayBuffer, function(buffer) {
        audioBuffer = buffer;
        metadataForm.style.display = 'block';
      }, function(err) {
        console.error('デコードエラー', err);
      });
    };
    reader.readAsArrayBuffer(file);
  });

  updateMetadataButton.addEventListener('click', function() {
    if (!audioBuffer || !albumArtBlob || !uploadedFile) return;

    const metaData = {
      title: titleInput.value,
      artist: artistInput.value
    };

    const writer = new ID3Writer(audioBuffer);
    writer.setFrame('TIT2', metaData.title);
    writer.setFrame('TPE1', [metaData.artist]);
    writer.setFrame('APIC', {
      type: 3,
      data: albumArtBlob,
      description: 'Album Artwork'
    });

    const blobWithTags = writer.getBlob();
    const urlWithTags = URL.createObjectURL(blobWithTags);

    downloadLink.style.display = 'block';
    downloadButton.href = urlWithTags;
    // ファイル名の展開を修正
    downloadButton.download = `edited_${uploadedFile.name}`;
  });
});
