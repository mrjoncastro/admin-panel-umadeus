import { Router, Request, Response } from 'express'
import { ProductRepository } from '../../repositories/ProductRepository'
import { CreateProductRequest, UpdateProductRequest, QueryFilters } from '../../types'
import { z } from 'zod'

const router = Router()
const productRepo = new ProductRepository()

// Middleware para extrair tenant_id do header
const getTenantId = (req: Request): string => {
  const tenantId = req.headers['x-tenant-id'] as string
  if (!tenantId) {
    throw new Error('Tenant ID é obrigatório')
  }
  return tenantId
}

// Schemas de validação
const createProductSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  user_org: z.string().min(1, 'User org é obrigatório'),
  quantidade: z.number().min(0, 'Quantidade deve ser >= 0'),
  preco: z.number().min(0, 'Preço deve ser >= 0'),
  preco_bruto: z.number().min(0, 'Preço bruto deve ser >= 0'),
  ativo: z.boolean().optional(),
  tamanhos: z.array(z.string()).optional(),
  imagens: z.array(z.string()).optional(),
  descricao: z.string().optional(),
  detalhes: z.string().optional(),
  categoria: z.string().optional(),
  slug: z.string().min(1, 'Slug é obrigatório'),
  cores: z.array(z.string()).optional(),
  generos: z.array(z.string()).optional(),
  exclusivo_user: z.boolean().optional(),
  requer_inscricao_aprovada: z.boolean().optional(),
  evento_id: z.string().optional()
})

const updateProductSchema = createProductSchema.partial()

// GET /api/v1/products - Listar produtos
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    
    const filters: QueryFilters = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      perPage: req.query.perPage ? parseInt(req.query.perPage as string) : 20,
      ativo: req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined,
      categoria: req.query.categoria as string,
      slug: req.query.slug as string,
      search: req.query.search as string
    }

    const [products, totalCount] = await Promise.all([
      productRepo.findAll(tenantId, filters),
      productRepo.count(tenantId, filters)
    ])

    const totalPages = Math.ceil(totalCount / (filters.perPage || 20))

    res.json({
      success: true,
      data: products,
      pagination: {
        page: filters.page || 1,
        perPage: filters.perPage || 20,
        totalItems: totalCount,
        totalPages
      }
    })
  } catch (error) {
    console.error('Erro ao listar produtos:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// GET /api/v1/products/:id - Buscar produto por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const product = await productRepo.findById(tenantId, id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      })
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// GET /api/v1/products/slug/:slug - Buscar produto por slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { slug } = req.params

    const product = await productRepo.findBySlug(tenantId, slug)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      })
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Erro ao buscar produto por slug:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// POST /api/v1/products - Criar produto
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    
    // Validar dados de entrada
    const validatedData = createProductSchema.parse(req.body)
    
    const productData: CreateProductRequest = {
      ...validatedData,
      cliente: tenantId
    }

    const product = await productRepo.create(tenantId, productData)

    res.status(201).json({
      success: true,
      data: product,
      message: 'Produto criado com sucesso'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      })
    }
    
    console.error('Erro ao criar produto:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// PATCH /api/v1/products/:id - Atualizar produto
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params
    
    // Validar dados de entrada
    const validatedData = updateProductSchema.parse(req.body)
    
    const product = await productRepo.update(tenantId, id, validatedData)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      })
    }

    res.json({
      success: true,
      data: product,
      message: 'Produto atualizado com sucesso'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      })
    }
    
    console.error('Erro ao atualizar produto:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// DELETE /api/v1/products/:id - Deletar produto
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params

    const deleted = await productRepo.delete(tenantId, id)
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// PATCH /api/v1/products/:id/stock - Atualizar estoque
router.patch('/:id/stock', async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req)
    const { id } = req.params
    const { quantity } = req.body

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade deve ser um número positivo'
      })
    }

    const product = await productRepo.updateStock(tenantId, id, quantity)
    
    if (!product) {
      return res.status(400).json({
        success: false,
        error: 'Estoque insuficiente ou produto não encontrado'
      })
    }

    res.json({
      success: true,
      data: product,
      message: 'Estoque atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

export default router 