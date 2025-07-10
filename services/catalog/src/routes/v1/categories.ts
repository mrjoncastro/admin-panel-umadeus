import { Router, Request, Response } from 'express'
import { CategoryRepository } from '../../repositories/CategoryRepository'
import { CreateCategoryRequest, UpdateCategoryRequest } from '../../types'
import { z } from 'zod'

const router = Router()
const categoryRepo = new CategoryRepository()

// Middleware para extrair tenant_id do header
const getTenantId = (req: Request): string => {
  const tenantId = req.headers['x-tenant-id'] as string
  if (!tenantId) {
    throw new Error('Tenant ID é obrigatório')
  }
  return tenantId
}

// Schemas de validação
const createCategorySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório')
})

const updateCategorySchema = createCategorySchema.partial()

// GET /api/v1/categories - Listar categorias
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    
    const categories = await categoryRepo.findAll(tenantId)

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Erro ao listar categorias:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// GET /api/v1/categories/:id - Buscar categoria por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const category = await categoryRepo.findById(tenantId, id)
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      })
    }

    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// GET /api/v1/categories/slug/:slug - Buscar categoria por slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { slug } = req.params

    const category = await categoryRepo.findBySlug(tenantId, slug)
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      })
    }

    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Erro ao buscar categoria por slug:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// POST /api/v1/categories - Criar categoria
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    
    // Validar dados de entrada
    const validatedData = createCategorySchema.parse(req.body)
    
    const categoryData: CreateCategoryRequest = {
      ...validatedData,
      cliente: tenantId
    }

    const category = await categoryRepo.create(tenantId, categoryData)

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoria criada com sucesso'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      })
    }
    
    console.error('Erro ao criar categoria:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// PATCH /api/v1/categories/:id - Atualizar categoria
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params
    
    // Validar dados de entrada
    const validatedData = updateCategorySchema.parse(req.body)
    
    // Filtrar campos undefined
    const updateData: UpdateCategoryRequest = {}
    if (validatedData.nome !== undefined) updateData.nome = validatedData.nome
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug
    
    const category = await categoryRepo.update(tenantId, id, updateData)
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      })
    }

    res.json({
      success: true,
      data: category,
      message: 'Categoria atualizada com sucesso'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      })
    }
    
    console.error('Erro ao atualizar categoria:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// DELETE /api/v1/categories/:id - Deletar categoria
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const deleted = await categoryRepo.delete(tenantId, id)
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('produtos associados')) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }
    
    console.error('Erro ao deletar categoria:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

export default router 