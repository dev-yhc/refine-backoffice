import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface Content {
  order: number
  tvingContentCode: string
  pipContentCode: string
  name: string
  tierName: string
  tierPrice: number
  contentTypeNm: string
  gradeNm: string
  gradeKindNm: string
  tvingExclusiveType: string | null
  broadcastStartDate: number
  broadcastEndDate: number | null
  broadcastWeekdays: string
  releaseStatus: string
  isIncludedTier: boolean
}

interface ApiResponse {
  code: string
  message: string
  detailMessage: string
  data: {
    date: number
    totalCount: number
    list: Content[]
  }
}

export const AdProductPage = () => {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('1')
  const pageSize = 20

  const fetchContents = async (pageNo: number): Promise<ApiResponse> => {
    const response = await axios.get(
      `https://ex-mtapi-dev.aws.tving.com/v1/internal/ads/tiers/contents?tierId=${selectedTier}&pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: {
          accept: 'application/json',
          adminId: 'adminId'
        }
      }
    )
    return response.data
  }

  const { data, isLoading, isError } = useQuery<ApiResponse, Error>(
    ['contents', selectedTier, page],
    () => fetchContents(page),
    { keepPreviousData: true }
  )

  const handleTierChange = (value: string) => {
    setSelectedTier(value)
    setPage(1)
  }

  const filteredContents = data?.data.list.filter(
    content => 
      content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tvingContentCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="container h-screen p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">RTB Video Content Management</h1>

      <div className="flex gap-4 h-full">
        {/* Left Container: Tier Information */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Tier Information</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="mb-4">
              <Select onValueChange={handleTierChange} value={selectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Tier" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md">
                  <SelectItem value="1">Tier 1</SelectItem>
                  <SelectItem value="2">Tier 2</SelectItem>
                  <SelectItem value="3">Tier 3</SelectItem>
                  <SelectItem value="4">Non-Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Selected Tier: {selectedTier}</h3>
                <p>Total Contents: {data?.data.totalCount || 0}</p>
              </div>
              <div>
                <div className="flex justify-between items-center mt-2">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span>Page {page}</span>
                  <Button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!data || data.data.list.length < pageSize}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Container: Content Table */}
        <Card className="flex-2 flex flex-col">
          <CardHeader>
            <CardTitle>Content List</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Error loading data</TableCell>
                  </TableRow>
                ) : (
                  filteredContents.map(content => (
                    <TableRow key={content.tvingContentCode}>
                      <TableCell>{content.order}</TableCell>
                      <TableCell>{content.name}</TableCell>
                      <TableCell>{content.tierName}</TableCell>
                      <TableCell>{content.tierPrice.toLocaleString()}</TableCell>
                      <TableCell>{content.contentTypeNm}</TableCell>
                      <TableCell>{content.gradeNm}</TableCell>
                      <TableCell>{content.releaseStatus}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}