import React, { useState, useEffect, useRef } from "react";
import Header from "../components/header";
import { SAPIBase } from "../tools/api";
import "./css/image.css"

type ImageItem = {
  id: string;
  filename: string;
  isStatic?: boolean; // 맨 앞 고정 cat.jpeg 구분용
};

const CatImagePage = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingNewFile, setPendingNewFile] = useState<File | null>(null);
  const [pendingReplaceFile, setPendingReplaceFile] = useState<File | null>(null);
  const newFileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : null;

  const fetchImages = async () => {
    try {
      const res = await fetch(`${SAPIBase}/images/list`);
      const data: ImageItem[] = await res.json();

      const defaultImage: ImageItem = {
        id: "static-cat",
        filename: "cat.jpeg",
        isStatic: true,
      };

      // cat.jpeg 항상 맨 앞
      setImages([
        { id: "static-cat", filename: "cat.jpeg", isStatic: true },
        ...data.map(img => ({ ...img, isStatic: false }))
      ]);
      setCurrentIndex(0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // 업로드 이미지 선택
  const handlePendingNewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setPendingNewFile(e.target.files[0]); // 즉시 업로드 대신 저장만
  };

  // 새 이미지 업로드 (맨 뒤에 추가)
  const confirmUploadNewFile = async () => {
    if (!pendingNewFile) return;

    const formData = new FormData();
    formData.append("image", pendingNewFile);

    setLoading(true);
    try {
      await fetch(`${SAPIBase}/images/upload`, {
        method: "POST",
        body: formData,
      });
      await fetchImages();
      setPendingNewFile(null);
      if (newFileInputRef.current) {
        newFileInputRef.current.value = "";
      }
    } finally {
      setLoading(false);
    }
  };

  // 교체 이미지 선택
  const handlePendingReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setPendingReplaceFile(e.target.files[0]);
  };

  // 현재 보고 있는 이미지를 새 업로드 이미지로 교체
  const confirmReplaceFile = async () => {
    const currentImage = images[currentIndex];
    if (!currentImage || currentImage.isStatic || !pendingReplaceFile) return;

    const formData = new FormData();
    formData.append("image", pendingReplaceFile);

    setLoading(true);
    try {
      await fetch(`${SAPIBase}/images/${currentImage.id}`, {
        method: "PUT",
        body: formData,
      });
      await fetchImages();
      setPendingReplaceFile(null);
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = "";
      }
    } finally {
      setLoading(false);
    }
  };

  // 현재 보고 있는 이미지 삭제
  const deleteCurrent = async () => {
    const currentImage = images[currentIndex];
    if (!currentImage || currentImage.isStatic) return;

    setLoading(true);
    try {
      await fetch(`${SAPIBase}/images/${currentImage.id}`, {
        method: "DELETE",
      });
      await fetchImages();
    } finally {
      setLoading(false);
    }
  };

  const showPrev = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNext = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const currentImageSrc =
    currentImage && currentImage.isStatic
      ? `${SAPIBase}/static/cat.jpeg`
      : currentImage
      ? `${SAPIBase}/images/${currentImage.id}`
      : "";

  return (
    <div className="cat-image-page">
      <Header />
      <h2>Image Carousel</h2>

      {/* 새 이미지 추가 업로드 */}
      <div className="upload-section">
        <label>
          새 이미지 선택
          <input
            type="file"
            accept="image/*"
            ref={newFileInputRef}
            onChange={handlePendingNewFile}
          />
        </label>

        {pendingNewFile && (
          <>
            <button onClick={confirmUploadNewFile} disabled={loading}>
              확인(업로드)
            </button>
          </>
        )}
      </div>

      {!hasImages && <p>아직 이미지가 없습니다.</p>}

      {hasImages && (
        <>
          <div className="carousel-image-wrapper">
            <button
              type="button"
              className="carousel-arrow left"
              onClick={showPrev}
            >
              ‹
            </button>

            {currentImage && (
              <img
                alt={currentImage.filename}
                src={currentImageSrc}
                className="carousel-image"
              />
            )}

            <button
              type="button"
              className="carousel-arrow right"
              onClick={showNext}
            >
              ›
            </button>
          </div>

          <p className="carousel-counter">
            {currentIndex + 1} / {images.length}
            {currentImage?.isStatic && " (static cat)"}
          </p>

          {/* 현재 이미지 삭제 / 교체 영역 */}
          <div className="edit-section">
            {/* 삭제 버튼 */}
            <button onClick={deleteCurrent} disabled={images[currentIndex]?.isStatic}>
              현재 이미지 삭제
            </button>

            {/* 교체 */}
            <label>
              교체할 이미지 선택
              <input
                type="file"
                accept="image/*"
                onChange={handlePendingReplaceFile}
                ref={replaceFileInputRef}
                disabled={images[currentIndex]?.isStatic}
              />
            </label>

            {pendingReplaceFile && (
              <>
                <button onClick={confirmReplaceFile} disabled={loading}>
                  확인(교체)
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CatImagePage;
