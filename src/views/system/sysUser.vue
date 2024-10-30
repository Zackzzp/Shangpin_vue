<template>
  <!---搜索表单-->
  <div class="search-div">
    <el-form label-width="70px" size="small">
      <el-row>
        <el-col :span="12">
          <el-form-item label="关键字">
            <el-input
              style="width: 100%"
              placeholder="用户名、姓名、手机号码"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-date-picker
              type="daterange"
              range-separator="To"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="display:flex">
        <el-button type="primary" size="small" @click="searchSysUser">
          搜索
        </el-button>
        <el-button size="small" @click="resetData">重置</el-button>
      </el-row>
    </el-form>
  </div>

  <!--添加按钮-->
  <div class="tools-div">
    <el-button type="success" size="small" @click="addShow">添 加</el-button>
  </div>

  <el-dialog v-model="diaglogVisible" title="添加或修改" width="40%">
    <el-form label-width="120px">
      <el-form-item label="用户名">
        <el-input />
      </el-form-item>
      <el-form-item label="密码">
        <el-input />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input />
      </el-form-item>
      <el-form-item label="手机">
        <el-input />
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          action="http://localhost:8501/admin/system/fileUpload"
          :show-file-list="false"
          :headers="headers"
          :on-success="handleUploadSuccess"
        >
          <img v-if="sysUser.avatar" :src="sysUser.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="描述">
        <el-input />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <!---数据表格-->
  <el-table :data="list" style="width: 100%">
    <el-table-column prop="userName" label="用户名" />
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="phone" label="手机" />
    <el-table-column prop="avatar" label="头像" #default="scope">
      <img :src="scope.row.avatar" width="50" />
    </el-table-column>
    <el-table-column prop="description" label="描述" />
    <el-table-column prop="status" label="状态" #default="scope">
      {{ scope.row.status == 1 ? '正常' : '停用' }}
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" align="center" width="280" #default="scope">
      <el-button type="primary" size="small" @click="editUser(scope.row)">
        修改
      </el-button>
      <el-button type="danger" size="small" @click="deleteById(scope.row)">
        删除
      </el-button>
      <el-button type="warning" size="small">
        分配角色
      </el-button>
    </el-table-column>
  </el-table>

  <el-pagination
    v-model:current-page="pageParams.page"
    v-model:page-size="pageParams.limit"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next"
    :total="total"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  GetSysUserListByPage,
  SaveSysUser,
  UpdateSysUser,
  DeleteSysUserById,
} from '@/api/sysUser'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApp } from '@/pinia/modules/app'
const headers = {
  Authorization: useApp().authorization.token, // 从pinia中获取token，在进行文件上传的时候将token设置到请求头中
}
onMounted(() => {
  fetchData()
})
// 表格数据模型
const list = ref([
  {
    id: 1,
    userName: 'admin',
    name: 'admin',
    phone: '13121034567',
    status: 1,
    createTime: '2023-05-11',
  },
  {
    id: 2,
    userName: 'admin',
    name: 'admin',
    phone: '13121034567',
    status: 1,
    createTime: '2023-05-11',
  },
])

// 分页条数据模型
const total = ref(0)

//定义搜索表单数据类型
const queryDto = ref({
  keyword: '',
  createTimeBegin: '',
  createTimeEnd: '',
})

const createTimes = ref([])

//分页数据
const pageParamsForm = {
  page: 1,
  limit: 10,
}
const pageParams = ref(pageParamsForm)
const searchSysUser = () => {
  fetchData()
}
const resetData = () => {
  queryDto.value = {}
  createTimes.value = []
}
const fetchData = async () => {
  if (createTimes.value.length == 2) {
    queryDto.value.createTimeBegin = createTimes.value[0]
    queryDto.value.createTimeEnd = createTimes.value[1]
  }
  const { code, message, data } = await GetSysUserListByPage(
    pageParams.value.page,
    pageParams.value.limit,
    queryDto.value
  )
  list.value = data.list
  total.value = data.total
}

//添加消息对话框
const diaglogVisible = ref(false)
const addShow = () => {
  diaglogVisible.value = true
}

const editUser = row => {
  diaglogVisible.value = true
  sysUser.value = row
}

//定义表单数据模型
const defaultForm = {
  userName: '',
  name: '',
  phone: '',
  password: '',
  description: '',
  avatar: '',
}
const sysUser = ref(defaultForm)

const submit = async () => {
  if (!sysUser.value.id) {
    const { code, message, data } = await SaveSysUser(sysUser.value)
    if (code === 200) {
      diaglogVisible.value = false
      ElMessage.success('操作成功')
      fetchData()
    } else {
      ElMessage.error(message)
    }
  } else {
    const { code, message, data } = await UpdateSysUser(sysUser.value)
    if (code === 200) {
      diaglogVisible.value = false
      ElMessage.success('操作成功')
      fetchData()
    } else {
      ElMessage.error(message)
    }
  }
}

// 删除角色
const deleteById = row => {
  ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const { code } = await DeleteSysUserById(row.id.toString())
      if (code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      }
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}
//文件上传成功处理逻辑
const handleUploadSuccess = (response, file, fileList) => {
  // 假设 response 是服务器返回的图片路径
  sysUser.value.avatar = 'http://47.121.222.152:8888/' + response
}
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
<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
