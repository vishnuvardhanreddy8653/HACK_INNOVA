def verify_face_mock(image_data: str, stored_embedding: str) -> bool:
    # Simulated biometric check
    # In a real system, you would decode image_data, extract features, and compare
    if len(image_data) > 10:
        return True
    return False
