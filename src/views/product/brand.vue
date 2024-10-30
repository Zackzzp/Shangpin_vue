<template>
  <div class="tools-div">
    <el-button type="success" size="small" @click="addShow">添 加</el-button>
  </div>

  <el-table :data="list" style="width: 100%">
    <el-table-column prop="name" label="品牌名称" />
    <el-table-column prop="logo" label="品牌图标" #default="scope">
      <img :src="scope.row.logo" width="50" />
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" align="center" width="200">
      <el-button type="primary" size="small">
        修改
      </el-button>
      <el-button type="danger" size="small">
        删除
      </el-button>
    </el-table-column>
  </el-table>

  <el-dialog v-model="dialogVisible" title="添加或修改" width="30%">
    <el-form label-width="120px">
      <el-form-item label="品牌名称">
        <el-input v-model="brand.name" />
      </el-form-item>
      <el-form-item label="品牌图标">
        <el-upload
          class="avatar-uploader"
          action="http://localhost:8501/admin/system/fileUpload"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :headers="headers"
        >
          <img v-if="brand.logo" :src="brand.logo" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveOrUpdate">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-pagination
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next"
    :total="total"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { GetBrandPageList, SaveBrand } from '@/api/brand'
import { ElMessage } from 'element-plus'
import { useApp } from '@/pinia/modules/app'
const headers = {
  Authorization: useApp().authorization.token, // 从pinia中获取token，在进行文件上传的时候将token设置到请求头中
}
//文件上传成功处理逻辑
const handleUploadSuccess = (response, file, fileList) => {
  // 假设 response 是服务器返回的图片路径
  brand.value.logo = 'http://47.121.222.152:8888/' + response
}
// 定义表格数据模型
const list = ref([])

// 分页条数据模型
const total = ref(0)

//定义分页数据模型
const pageParamsForm = {
  page: 1,
  limit: 10,
}
const pageParams = ref(pageParamsForm)

onMounted(() => {
  fetchData()
})

//页面变化
const handleSizeChange = size => {
  pageParams.value.limit = size
  fetchData()
}
const handleCurrentChange = number => {
  pageParams.value.page = number
  fetchData()
}
//分页查询
const fetchData = async () => {
  const { code, message, data } = await GetBrandPageList(
    pageParams.value.page,
    pageParams.value.limit
  )
  list.value = data.list
  total.value = data.total
}
// 定义提交表单数据模型
const defaultForm = {
  id: '',
  name: '',
  logo: '',
}
const brand = ref(defaultForm)
const dialogVisible = ref(false)

// 显示添加品牌表单
const addShow = () => {
  brand.value = {}
  dialogVisible.value = true
}

// 保存数据
const saveOrUpdate = () => {
  if (!brand.value.id) {
    saveData()
  }
}

// 新增
const saveData = async () => {
  await SaveBrand(brand.value)
  dialogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}
</script>

<style scoped>
.tools-div {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
</style>
