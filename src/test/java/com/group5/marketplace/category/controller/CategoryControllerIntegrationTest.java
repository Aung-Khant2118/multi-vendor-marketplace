package com.group5.marketplace.category.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group5.marketplace.category.dto.CategoryRequest;
import com.group5.marketplace.category.dto.CategoryResponse;
import com.group5.marketplace.category.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CategoryControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private CategoryService categoryService;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        CategoryController controller = new CategoryController(categoryService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getAll_returnsList() throws Exception {
        CategoryResponse resp = CategoryResponse.builder()
                .id(1L)
                .name("Electronics")
                .slug("electronics")
                .description("desc")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(categoryService.getAll()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/categories").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    void getBySlug_returnsItem() throws Exception {
        CategoryResponse resp = CategoryResponse.builder()
                .id(2L)
                .name("Books")
                .slug("books")
                .description("books")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(categoryService.getBySlug("books")).thenReturn(resp);

        mockMvc.perform(get("/api/categories/books").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.slug").value("books"));
    }

    @Test
    void create_returnsCreated() throws Exception {
        CategoryRequest req = new CategoryRequest();
        req.setName("New Cat");
        req.setSlug("new-cat");

        CategoryResponse resp = CategoryResponse.builder()
                .id(3L)
                .name("New Cat")
                .slug("new-cat")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(categoryService.create(any(CategoryRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(3))
                .andExpect(jsonPath("$.data.name").value("New Cat"));
    }
}
