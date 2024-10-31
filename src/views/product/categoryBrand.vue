<template>
  <el-dialog v-model="dialogVisible" title="添加或修改" width="30%">
    <el-form label-width="120px">
      <el-form-item label="品牌">
        <el-select
          class="m-2"
          placeholder="选择品牌"
          size="small"
          v-model="categoryBrand.brandId"
        >
          <el-option
            v-for="item in brandList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分类">
        <el-cascader
          :props="categoryProps"
          v-model="categoryBrand.categoryId"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveOrUpdate">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <div class="search-div">
    <el-form label-width="70px" size="small">
      <el-row>
        <el-col :span="12">
          <el-form-item label="品牌">
            <el-select
              class="m-2"
              placeholder="选择品牌"
              size="small"
              style="width: 100%"
              v-model="queryDto.brandId"
            >
              <el-option
                v-for="item in brandList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类">
            <el-cascader
              :props="categoryProps"
              style="width: 100%"
              v-model="searchCategoryIdList"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="display:flex">
        <el-button type="primary" size="small" @click="fetchData">
          搜索
        </el-button>
        <el-button size="small" @click="resetData">重置</el-button>
      </el-row>
    </el-form>
  </div>

  <div class="tools-div">
    <el-button type="success" size="small" @click="addShow">添 加</el-button>
  </div>

  <el-table :data="list" style="width: 100%">
    <el-table-column prop="categoryName" label="分类" />
    <el-table-column prop="brandName" label="品牌" />
    <el-table-column prop="logo" label="品牌图标" #default="scope">
      <img :src="scope.row.logo" width="50" />
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" align="center" width="200" #default="scope">
      <el-button type="primary" size="small" @click="editShow(scope.row)">
        修改
      </el-button>
      <el-button type="danger" size="small" @click="remove(scope.row.id)">
        删除
      </el-button>
    </el-table-column>
  </el-table>

  <el-pagination
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next"
    :total="total"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FindAllBrand } from '@/api/brand'
import { FindCategoryByParentId } from '@/api/category'
import {
  GetCategoryBrandPageList,
  SaveCategoryBrand,
  UpdateCategoryBrandById,
  DeleteCategoryBrandById,
} from '@/api/categoryBrand'
import { ElMessage, ElMessageBox } from 'element-plus'

const selectAllBrandList = async () => {
  const { data } = await FindAllBrand()
  brandList.value = data
}

onMounted(() => {
  selectAllBrandList()
  fetchData()
})
//重置
const resetData = () => {
  queryDto.value = { brandId: '', categoryId: '' }
  fetchData()
}

//页面变化
const handleSizeChange = size => {
  pageParams.value.limit = size
  fetchData()
}
const handleCurrentChange = number => {
  pageParams.value.page = number
  fetchData()
}

// 分页列表查询
//分页列表
const fetchData = async () => {
  if (searchCategoryIdList.value.length == 3) {
    queryDto.value.categoryId = searchCategoryIdList.value[2]
  }
  const { data } = await GetCategoryBrandPageList(
    pageParams.value.page,
    pageParams.value.limit,
    queryDto.value
  )
  list.value = data.list
  total.value = data.total
}

const addShow = () => {
  dialogVisible.value = true
}

//进入修改
const editShow = row => {
  categoryBrand.value = row
  dialogVisible.value = true
}

//提交保存与修改
const saveOrUpdate = () => {
  if (categoryBrand.value.brandId == '') {
    ElMessage.info('品牌信息必须选择')
    return
  }
  //categoryId为数组：[1,2,3]
  if (categoryBrand.value.categoryId.length != 3) {
    ElMessage.info('分类信息必须选择')
    return
  }
  //系统只需要三级分类id
  categoryBrand.value.categoryId = categoryBrand.value.categoryId[2]
  if (!categoryBrand.value.id) {
    saveData()
  } else {
    updateData()
  }
}

// 修改
const updateData = async () => {
  await UpdateCategoryBrandById(categoryBrand.value)
  dialogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}
// 新增
const saveData = async () => {
  await SaveCategoryBrand(categoryBrand.value)
  dialogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}

//删除
const remove = async id => {
  ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await DeleteCategoryBrandById(id)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}
// ================数据模型定义  start ===============================================

const defaultForm = {
  //页面表单数据
  id: '',
  brandId: '',
  categoryId: '',
}
const categoryBrand = ref(defaultForm)

const dialogVisible = ref(false)
// 搜索表单数据模型
const queryDto = ref({ brandId: '', categoryId: '' })
const searchCategoryIdList = ref([])

//分页条数据模型
const pageParamsForm = {
  page: 1, // 页码
  limit: 10, // 每页记录数
}
const pageParams = ref(pageParamsForm)

// 定义搜索表单数据模型
const brandList = ref([
  {
    id: 2,
    createTime: '2023-05-06 09:31:19',
    name: '华为',
    logo: 'http://139.198.127.41:9000/sph/20230506/华为.png',
  },
  {
    id: 1,
    createTime: '2023-05-06 09:30:27',
    name: '小米',
    logo: 'http://139.198.127.41:9000/sph/20230506/小米.png',
  },
])

const props = {
  lazy: true,
  value: 'id',
  label: 'name',
  leaf: 'leaf',
  async lazyLoad(node, resolve) {
    // 加载数据的方法
    if (typeof node.value == 'undefined') node.value = 0
    const { data } = await FindCategoryByParentId(node.value)
    data.forEach(function(item) {
      //hasChildren判断是否有子节点
      item.leaf = !item.hasChildren
    })
    resolve(data) // 返回数据
  },
}

const categoryProps = ref(props)

// 定义表格数据模型
const list = ref([
  {
    id: 2,
    createTime: '2023-05-24 15:19:24',
    brandId: 1,
    categoryId: 99,
    categoryName: '定制服务',
    brandName: '小米',
    logo: 'http://139.198.127.41:9000/sph/20230506/小米.png',
  },
  {
    id: 1,
    createTime: '2023-05-06 10:59:08',
    brandId: 2,
    categoryId: 76,
    categoryName: 'UPS电源\t',
    brandName: '华为',
    logo: 'http://139.198.127.41:9000/sph/20230506/华为.png',
  },
])

// 分页条数据模型
const total = ref(0)

// =========   数据模型定义 end======================================================================
</script>

<style scoped>
.search-div {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}

.tools-div {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
</style>
