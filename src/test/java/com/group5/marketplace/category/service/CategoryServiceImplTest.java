package com.group5.marketplace.category.service;

import com.group5.marketplace.category.dto.CategoryRequest;
import com.group5.marketplace.category.dto.CategoryResponse;
import com.group5.marketplace.category.entity.Category;
import com.group5.marketplace.category.mapper.CategoryMapper;
import com.group5.marketplace.category.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Captor
    private ArgumentCaptor<Category> categoryCaptor;

    private CategoryRequest request;
    private Category category;
    private CategoryResponse response;

    @BeforeEach
    void setUp() {
        request = new CategoryRequest();
        request.setName("Electronics");
        request.setSlug("electronics");
        request.setDescription("All electronic items");
        request.setImageUrl(null);
        request.setActive(true);

        category = Category.builder()
                .id(1L)
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        response = CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    @Test
    void create_shouldThrow_whenNameExists() {
        when(categoryRepository.existsByName(request.getName())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> categoryService.create(request));
        assertEquals("Category name already exists.", ex.getMessage());

        verify(categoryRepository).existsByName(request.getName());
        verifyNoMoreInteractions(categoryRepository);
    }

    @Test
    void create_shouldThrow_whenSlugExists() {
        when(categoryRepository.existsByName(request.getName())).thenReturn(false);
        when(categoryRepository.existsBySlug(request.getSlug())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> categoryService.create(request));
        assertEquals("Category slug already exists.", ex.getMessage());

        verify(categoryRepository).existsByName(request.getName());
        verify(categoryRepository).existsBySlug(request.getSlug());
        verifyNoMoreInteractions(categoryRepository);
    }

    @Test
    void create_shouldSaveAndReturnResponse() {
        when(categoryRepository.existsByName(request.getName())).thenReturn(false);
        when(categoryRepository.existsBySlug(request.getSlug())).thenReturn(false);
        when(categoryMapper.toEntity(request)).thenReturn(category);
        when(categoryRepository.save(category)).thenReturn(category);
        when(categoryMapper.toResponse(category)).thenReturn(response);

        CategoryResponse res = categoryService.create(request);

        assertNotNull(res);
        assertEquals(response.getId(), res.getId());
        assertEquals(response.getName(), res.getName());

        verify(categoryRepository).existsByName(request.getName());
        verify(categoryRepository).existsBySlug(request.getSlug());
        verify(categoryMapper).toEntity(request);
        verify(categoryRepository).save(category);
        verify(categoryMapper).toResponse(category);
    }

    @Test
    void getAll_shouldReturnOnlyActive() {
        Category inactive = Category.builder().id(2L).name("Old").slug("old").active(false).build();
        when(categoryRepository.findAll()).thenReturn(List.of(category, inactive));
        when(categoryMapper.toResponse(category)).thenReturn(response);

        List<CategoryResponse> list = categoryService.getAll();

        assertEquals(1, list.size());
        assertEquals(response.getId(), list.get(0).getId());

        verify(categoryRepository).findAll();
        verify(categoryMapper).toResponse(category);
        verifyNoMoreInteractions(categoryMapper);
    }

    @Test
    void getById_shouldThrow_whenNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> categoryService.getById(99L));
        assertEquals("Category not found.", ex.getMessage());

        verify(categoryRepository).findById(99L);
    }

    @Test
    void getBySlug_shouldReturnResponse() {
        when(categoryRepository.findBySlug("electronics")).thenReturn(Optional.of(category));
        when(categoryMapper.toResponse(category)).thenReturn(response);

        CategoryResponse res = categoryService.getBySlug("electronics");

        assertNotNull(res);
        assertEquals("electronics", res.getSlug());
        verify(categoryRepository).findBySlug("electronics");
        verify(categoryMapper).toResponse(category);
    }

    @Test
    void update_shouldThrowWhenNameTakenByOther() {
        Category other = Category.builder().id(2L).name("Gadgets").build();
        CategoryRequest req = new CategoryRequest();
        req.setName("Gadgets");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.findByName("Gadgets")).thenReturn(Optional.of(other));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> categoryService.update(1L, req));
        assertEquals("Category name already exists.", ex.getMessage());

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).findByName("Gadgets");
    }

    @Test
    void update_shouldApplyChanges() {
        CategoryRequest req = new CategoryRequest();
        req.setName("New Name");
        req.setSlug("new-slug");
        req.setDescription("desc");
        req.setActive(false);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.findByName("New Name")).thenReturn(Optional.empty());
        when(categoryRepository.findBySlug("new-slug")).thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(CategoryResponse.builder().id(1L).name("New Name").slug("new-slug").description("desc").active(false).build());

        CategoryResponse updated = categoryService.update(1L, req);

        assertNotNull(updated);
        assertEquals("New Name", updated.getName());
        assertEquals("new-slug", updated.getSlug());
        assertFalse(updated.getActive());

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).findByName("New Name");
        verify(categoryRepository).findBySlug("new-slug");
        verify(categoryRepository).save(categoryCaptor.capture());

        Category saved = categoryCaptor.getValue();
        assertEquals("New Name", saved.getName());
        assertEquals("new-slug", saved.getSlug());
    }

    @Test
    void delete_shouldSoftDelete() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        categoryService.delete(1L);

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).save(categoryCaptor.capture());
        Category saved = categoryCaptor.getValue();
        assertFalse(saved.getActive());
    }
}
