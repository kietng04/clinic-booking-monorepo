-- Seed common medications

-- Giảm đau - Hạ sốt
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Giảm đau - Hạ sốt', 'viên', '1 viên', '3 lần/ngày', '5 ngày', 'Uống sau ăn, cách nhau 4-6 tiếng. Không uống quá 8 viên/ngày'),
('Paracetamol 650mg', 'Paracetamol', 'Giảm đau - Hạ sốt', 'viên', '1 viên', '3 lần/ngày', '5 ngày', 'Uống sau ăn, cách nhau 6 tiếng'),
('Ibuprofen 400mg', 'Ibuprofen', 'Giảm đau - Hạ sốt', 'viên', '1 viên', '3 lần/ngày', '5 ngày', 'Uống sau ăn no. Không dùng cho người có vấn đề dạ dày'),
('Aspirin 81mg', 'Aspirin', 'Giảm đau - Hạ sốt', 'viên', '1 viên', '1 lần/ngày', '30 ngày', 'Uống sau ăn sáng');

-- Kháng sinh
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Amoxicillin 500mg', 'Amoxicillin', 'Kháng sinh', 'viên', '1 viên', '3 lần/ngày', '7 ngày', 'Uống sau ăn. Uống đủ liều kể cả khi đã hết triệu chứng'),
('Amoxicillin 250mg', 'Amoxicillin', 'Kháng sinh', 'viên', '2 viên', '3 lần/ngày', '7 ngày', 'Uống sau ăn. Uống đủ liều kể cả khi đã hết triệu chứng'),
('Azithromycin 500mg', 'Azithromycin', 'Kháng sinh', 'viên', '1 viên', '1 lần/ngày', '3 ngày', 'Uống 1 giờ trước ăn hoặc 2 giờ sau ăn'),
('Cefixime 200mg', 'Cefixime', 'Kháng sinh', 'viên', '1 viên', '2 lần/ngày', '7 ngày', 'Uống sau ăn sáng và tối'),
('Ciprofloxacin 500mg', 'Ciprofloxacin', 'Kháng sinh', 'viên', '1 viên', '2 lần/ngày', '7 ngày', 'Uống cách xa bữa ăn 2 giờ. Uống nhiều nước'),
('Metronidazole 500mg', 'Metronidazole', 'Kháng sinh', 'viên', '1 viên', '3 lần/ngày', '7 ngày', 'Uống sau ăn. Không uống rượu bia trong thời gian điều trị');

-- Dạ dày - Tiêu hóa
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Omeprazole 20mg', 'Omeprazole', 'Dạ dày - Tiêu hóa', 'viên', '1 viên', '1 lần/ngày', '14 ngày', 'Uống trước ăn sáng 30 phút'),
('Pantoprazole 40mg', 'Pantoprazole', 'Dạ dày - Tiêu hóa', 'viên', '1 viên', '1 lần/ngày', '14 ngày', 'Uống trước ăn sáng 30 phút'),
('Domperidone 10mg', 'Domperidone', 'Dạ dày - Tiêu hóa', 'viên', '1 viên', '3 lần/ngày', '7 ngày', 'Uống 15-30 phút trước ăn'),
('Smecta', 'Diosmectite', 'Dạ dày - Tiêu hóa', 'gói', '1 gói', '3 lần/ngày', '3 ngày', 'Pha với nước, uống giữa các bữa ăn'),
('Phosphalugel', 'Aluminium Phosphate', 'Dạ dày - Tiêu hóa', 'gói', '1 gói', '2-3 lần/ngày', '7 ngày', 'Uống sau ăn 1-2 giờ hoặc khi đau');

-- Kháng dị ứng
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Loratadine 10mg', 'Loratadine', 'Kháng dị ứng', 'viên', '1 viên', '1 lần/ngày', '7 ngày', 'Uống sáng hoặc tối. Không gây buồn ngủ'),
('Cetirizine 10mg', 'Cetirizine', 'Kháng dị ứng', 'viên', '1 viên', '1 lần/ngày', '7 ngày', 'Uống tối trước khi ngủ. Có thể gây buồn ngủ nhẹ'),
('Chlorpheniramine 4mg', 'Chlorpheniramine', 'Kháng dị ứng', 'viên', '1 viên', '3 lần/ngày', '5 ngày', 'Gây buồn ngủ. Không lái xe sau khi uống');

-- Ho - Cảm
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Acetylcysteine 200mg', 'Acetylcysteine', 'Ho - Cảm', 'gói', '1 gói', '3 lần/ngày', '5 ngày', 'Pha với nước, uống sau ăn. Giúp long đờm'),
('Dextromethorphan 15mg', 'Dextromethorphan', 'Ho - Cảm', 'viên', '1 viên', '3 lần/ngày', '5 ngày', 'Uống khi ho khan. Không dùng khi có đờm'),
('Bromhexine 8mg', 'Bromhexine', 'Ho - Cảm', 'viên', '1 viên', '3 lần/ngày', '7 ngày', 'Uống sau ăn. Uống nhiều nước'),
('Strepsils', 'Amylmetacresol + Dichlorobenzyl', 'Ho - Cảm', 'viên', '1 viên', 'Mỗi 2-3 giờ', '5 ngày', 'Ngậm cho tan trong miệng. Tối đa 8 viên/ngày');

-- Vitamin - Bổ sung
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Vitamin C 500mg', 'Ascorbic Acid', 'Vitamin - Bổ sung', 'viên', '1 viên', '1 lần/ngày', '30 ngày', 'Uống sau ăn sáng'),
('Vitamin B Complex', 'Vitamin B1, B6, B12', 'Vitamin - Bổ sung', 'viên', '1 viên', '1 lần/ngày', '30 ngày', 'Uống sau ăn sáng'),
('Calcium + Vitamin D3', 'Calcium Carbonate + Cholecalciferol', 'Vitamin - Bổ sung', 'viên', '1 viên', '2 lần/ngày', '30 ngày', 'Uống sau ăn sáng và tối'),
('Iron (Sắt) 60mg', 'Ferrous Sulfate', 'Vitamin - Bổ sung', 'viên', '1 viên', '1 lần/ngày', '30 ngày', 'Uống khi đói hoặc với nước cam. Không uống với sữa'),
('Omega-3 Fish Oil 1000mg', 'EPA + DHA', 'Vitamin - Bổ sung', 'viên', '1 viên', '1-2 lần/ngày', '30 ngày', 'Uống sau ăn');

-- Tim mạch - Huyết áp
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Amlodipine 5mg', 'Amlodipine', 'Tim mạch - Huyết áp', 'viên', '1 viên', '1 lần/ngày', 'Dài hạn', 'Uống sáng. Theo dõi huyết áp thường xuyên'),
('Losartan 50mg', 'Losartan', 'Tim mạch - Huyết áp', 'viên', '1 viên', '1 lần/ngày', 'Dài hạn', 'Uống sáng. Theo dõi huyết áp thường xuyên'),
('Atorvastatin 20mg', 'Atorvastatin', 'Tim mạch - Huyết áp', 'viên', '1 viên', '1 lần/ngày', 'Dài hạn', 'Uống tối trước khi ngủ. Giảm mỡ máu');

-- Tiểu đường
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Metformin 500mg', 'Metformin', 'Tiểu đường', 'viên', '1 viên', '2 lần/ngày', 'Dài hạn', 'Uống trong bữa ăn. Theo dõi đường huyết'),
('Metformin 850mg', 'Metformin', 'Tiểu đường', 'viên', '1 viên', '2 lần/ngày', 'Dài hạn', 'Uống trong bữa ăn. Theo dõi đường huyết'),
('Gliclazide 30mg', 'Gliclazide', 'Tiểu đường', 'viên', '1 viên', '1 lần/ngày', 'Dài hạn', 'Uống trước bữa sáng');

-- Da liễu
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Clotrimazole Cream 1%', 'Clotrimazole', 'Da liễu', 'tuýp', 'Bôi mỏng', '2 lần/ngày', '14 ngày', 'Bôi lên vùng da bị bệnh sau khi vệ sinh sạch'),
('Hydrocortisone Cream 1%', 'Hydrocortisone', 'Da liễu', 'tuýp', 'Bôi mỏng', '2 lần/ngày', '7 ngày', 'Bôi lên vùng da bị viêm. Không bôi lên mặt quá 5 ngày'),
('Acyclovir Cream 5%', 'Acyclovir', 'Da liễu', 'tuýp', 'Bôi mỏng', '5 lần/ngày', '5 ngày', 'Bôi lên vùng da bị herpes ngay khi có triệu chứng');

-- Mắt
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Tobramycin Eye Drops', 'Tobramycin', 'Mắt', 'lọ', '1-2 giọt', '4 lần/ngày', '7 ngày', 'Nhỏ vào mắt, nghiêng đầu 2 phút sau nhỏ'),
('Artificial Tears', 'Carboxymethylcellulose', 'Mắt', 'lọ', '1-2 giọt', 'Khi cần', '30 ngày', 'Nhỏ khi mắt khô. Có thể dùng thường xuyên');

-- An thần - Giấc ngủ
INSERT INTO medications (name, generic_name, category, unit, default_dosage, default_frequency, default_duration, instructions) VALUES
('Melatonin 3mg', 'Melatonin', 'An thần - Giấc ngủ', 'viên', '1 viên', '1 lần/ngày', '14 ngày', 'Uống 30 phút trước khi ngủ');
