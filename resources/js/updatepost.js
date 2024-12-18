require('dotenv').config();

// 환경 변수에서 EC2 퍼블릭 IP 주소를 가져옴
const EC2_PUBLIC_IP = process.env.EC2_PUBLIC_IP;

document.addEventListener('DOMContentLoaded', async function () {
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');
  const imageInput = document.getElementById('image');
  const uploadButton = document.querySelector('.upload-button');
  const submitButton = document.querySelector('.submit-button');
  const helperText = document.getElementById('helper-text');

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId'); // postId 가져오기
    console.log('게시글 ID:', postId); // ID 확인

    const response = await fetch(
      `${EC2_PUBLIC_IP}/api/board/${postId}/update`
    );
    if (!response.ok) {
      throw new Error('게시글을 불러오는 데 실패했습니다.');
    }
    const post = await response.json();

    titleInput.value = post.title;
    contentInput.value = post.content;
    if (post.image) {
      uploadButton.nextElementSibling.textContent = post.image.split('/').pop();
    }
  } catch (error) {
    console.error('게시글 불러오기 오류:', error);
    alert(error.message);
  }

  imageInput.addEventListener('change', function () {
    const file = imageInput.files[0];
    if (file) {
      uploadButton.nextElementSibling.textContent = file.name;
    }
  });

  titleInput.addEventListener('input', function () {
    if (titleInput.value.length > 26) {
      titleInput.value = titleInput.value.substring(0, 26);
    }
    checkInput();
  });

  contentInput.addEventListener('input', function () {
    checkInput();
  });

  function checkInput() {
    if (!titleInput.value || !contentInput.value) {
      helperText.style.display = 'block';
      submitButton.style.backgroundColor = '#ACA0EB';
    } else {
      helperText.style.display = 'none';
      submitButton.style.backgroundColor = '#7F6AEE';
    }
  }

  submitButton.addEventListener('click', async function () {
    if (titleInput.value && contentInput.value) {
      const updatedPost = {
        title: titleInput.value,
        content: contentInput.value,
        image: imageInput.files.length > 0 ? imageInput.files[0] : null, // 이미지 파일
      };

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('postId'); // postId 가져오기

        const formData = new FormData(); // FormData 객체 생성
        formData.append('title', updatedPost.title);
        formData.append('content', updatedPost.content);
        if (updatedPost.image) {
          formData.append('image', updatedPost.image); // 이미지 파일 추가
        }

        const response = await fetch(
          `${EC2_PUBLIC_IP}/api/board/${postId}/postupdate`,
          {
            method: 'PATCH',
            body: formData, // FormData를 요청 본문으로 전송
          }
        );

        if (!response.ok) {
          throw new Error('게시글 수정에 실패했습니다.');
        }

        alert('게시물이 수정되었습니다!');
        window.location.href = `board.html?postId=${postId}`;
      } catch (error) {
        console.error('게시물 수정 오류:', error);
        alert(error.message);
      }
    } else {
      checkInput();
    }
  });
});